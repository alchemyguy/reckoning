import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CriticalAnalysisSchema } from '../src/schemas/critical';
import { PraiseAnalysisSchema } from '../src/schemas/praise';
import { PRDDocumentSchema } from '../src/schemas/prd';

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  );
}

describe('CriticalAnalysisSchema', () => {
  it('accepts the forge-pulse critical fixture', () => {
    const result = CriticalAnalysisSchema.safeParse(fixture('critical-v1.json'));
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});

describe('PraiseAnalysisSchema', () => {
  it('accepts the forge-pulse praise fixture', () => {
    const result = PraiseAnalysisSchema.safeParse(fixture('praise-v1.json'));
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});

describe('PRDDocumentSchema', () => {
  it('accepts the forge-pulse prd fixture', () => {
    const result = PRDDocumentSchema.safeParse(fixture('prd-v1.json'));
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});

describe('PRDDocumentSchema — no research report (Mode A)', () => {
  it('accepts a PRD with no researchReportId', () => {
    const prd = {
      id: 'prd-001',
      projectId: 'my-idea',
      version: 'v1',
      createdAt: '2026-06-27T00:00:00Z',
      sections: [],
      assumptionsExplicit: [],
      contradictionsFlagged: [],
    };
    const result = PRDDocumentSchema.safeParse(prd);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});
