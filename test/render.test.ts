import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderVerdict } from '../src/render';
import type { CriticalAnalysis } from '../src/schemas/critical';
import type { PraiseAnalysis } from '../src/schemas/praise';

function fixture<T>(name: string): T {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  ) as T;
}

describe('renderVerdict', () => {
  const critical = fixture<CriticalAnalysis>('critical-v1.json');
  const praise = fixture<PraiseAnalysis>('praise-v1.json');
  const md = renderVerdict(critical, praise);

  it('renders a verdict banner', () => {
    expect(md).toMatch(/Verdict: (PROCEED|DESCOPE|KILL)/);
  });

  it('renders the strengths and market-skeptic sections', () => {
    expect(md).toContain('Strengths');
    expect(md).toContain('Market skeptic');
    expect(md).toContain('Why care?');
  });

  it('renders failure modes sorted with critical first', () => {
    expect(md).toContain('Failure modes');
    const firstCritical = md.indexOf('[critical/');
    const firstLow = md.indexOf('[low/');
    if (firstCritical !== -1 && firstLow !== -1) {
      expect(firstCritical).toBeLessThan(firstLow);
    }
  });

  it('marks do-not-regress strengths', () => {
    const hasDoNotRegress = praise.strengths.some((s) => s.doNotRegress);
    if (hasDoNotRegress) expect(md).toContain('DO NOT REGRESS');
  });

  it('renders non-obvious insights when the praise analysis has them', () => {
    if (praise.nonObviousInsights.length > 0) {
      expect(md).toContain('Non-obvious insights');
      expect(md).toContain(praise.nonObviousInsights[0]!.title);
    }
  });
});

describe('renderVerdict without praise (pre-mortem)', () => {
  const md = renderVerdict(fixture<CriticalAnalysis>('critical-v1.json'));

  it('renders a pre-mortem heading and verdict but no strengths', () => {
    expect(md).toContain('Reckoning Pre-mortem');
    expect(md).toMatch(/Verdict: (PROCEED|DESCOPE|KILL)/);
    expect(md).not.toContain('Strengths');
    expect(md).not.toContain('Praise confidence');
  });

  it('still renders failure modes and the market skeptic', () => {
    expect(md).toContain('Failure modes');
    expect(md).toContain('Market skeptic');
  });
});

describe('renderVerdict with multi-line markdown fields', () => {
  // The reviewer prompts require bullet lists inside text fields, so every line of a
  // field must stay nested under its list item (found in end-to-end skill testing).
  const bullets = '- first point\n- second point with **bold**';
  const critical = fixture<CriticalAnalysis>('critical-v1.json');
  const praise = fixture<PraiseAnalysis>('praise-v1.json');
  const multiCritical: CriticalAnalysis = {
    ...critical,
    failureModes: [{ ...critical.failureModes[0]!, consequence: bullets }],
    scalePain: [],
    userConfusionRisks: [],
    engineeringRegrets: [],
    marketSkeptic: { ...critical.marketSkeptic, whyNow: { ...critical.marketSkeptic.whyNow, detail: bullets } },
    killRecommendation: { kill: false, rationale: '- descope to one POS\n- validate with 5 stores' },
  };
  const multiPraise: PraiseAnalysis = {
    ...praise,
    strengths: [{ ...praise.strengths[0]!, whyItWorks: bullets }],
    nonObviousInsights: [{ ...praise.nonObviousInsights[0]!, detail: bullets, whyNonObvious: bullets }],
    overallAssessment: 'Praise summary line.',
  };
  const md = renderVerdict(multiCritical, multiPraise);
  const lines = md.split('\n');

  it('never leaves a field continuation line at column zero', () => {
    expect(lines).not.toContain('- second point with **bold**');
    expect(lines.filter((l) => l === '  - second point with **bold**').length).toBeGreaterThanOrEqual(4);
  });

  it('does not glue a label onto the first bullet of a field', () => {
    expect(md).not.toMatch(/_Why it's non-obvious:_ - /);
    expect(md).not.toMatch(/\[weak\] - first point/);
  });

  it('shows the kill recommendation rationale and the praise overall assessment', () => {
    expect(md).toContain('Kill recommendation');
    expect(lines).toContain('  - validate with 5 stores');
    expect(md).toContain('Praise summary line.');
  });

  it('leaves the praise summary out of a pre-mortem', () => {
    expect(renderVerdict(multiCritical)).not.toContain('Praise summary line.');
  });
});
