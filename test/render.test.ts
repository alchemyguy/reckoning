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
