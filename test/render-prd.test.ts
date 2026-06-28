import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderPRD } from '../src/render-prd';
import type { PRDDocument } from '../src/schemas/prd';

function fixture<T>(name: string): T {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  ) as T;
}

describe('renderPRD', () => {
  const prd = fixture<PRDDocument>('prd-v1.json');
  const md = renderPRD(prd);

  it('renders a draft-PRD header', () => {
    expect(md).toMatch(/# Draft PRD —/);
  });

  it('renders each section title in order with a confidence percentage', () => {
    expect(prd.sections.length).toBeGreaterThan(0);
    const first = prd.sections[0]!;
    expect(md).toContain(`## ${first.title}`);
    expect(md).toMatch(/confidence \d+%/);
    // section order preserved: first section title appears before the second
    if (prd.sections.length > 1) {
      const second = prd.sections[1]!;
      expect(md.indexOf(`## ${first.title}`)).toBeLessThan(md.indexOf(`## ${second.title}`));
    }
  });

  it('renders flags when a section has them', () => {
    const flagged = prd.sections.find((s) => s.flags.length > 0);
    if (flagged) expect(md).toContain(flagged.flags[0]!);
  });
});
