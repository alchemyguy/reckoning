import { describe, it, expect } from 'vitest';
import { deriveVerdict } from '../src/verdict';
import type { CriticalAnalysis } from '../src/schemas/critical';

function base(): CriticalAnalysis {
  const skeptic = (verdict: 'strong' | 'moderate' | 'weak') => ({
    question: 'q',
    verdict,
    detail: 'd',
  });
  return {
    id: 'c',
    projectId: 'p',
    prdVersion: 'v1',
    createdAt: '2026-01-01T00:00:00Z',
    modelUsed: 'm',
    failureModes: [],
    scalePain: [],
    userConfusionRisks: [],
    engineeringRegrets: [],
    marketSkeptic: {
      whyCare: skeptic('strong'),
      whyNow: skeptic('strong'),
      whyWin: skeptic('strong'),
      featureVsProduct: skeptic('strong'),
    },
    killRecommendation: { kill: false, rationale: '' },
    overallAssessment: '',
    confidence: 0.8,
  };
}

describe('deriveVerdict', () => {
  it('returns KILL when killRecommendation.kill is true', () => {
    const c = base();
    c.killRecommendation = { kill: true, rationale: 'fatal' };
    expect(deriveVerdict(c).verdict).toBe('KILL');
  });

  it('returns DESCOPE when there is a critical-severity item', () => {
    const c = base();
    c.failureModes = [
      {
        id: 'fm',
        prdSectionId: 's',
        title: 't',
        consequence: 'x',
        severity: 'critical',
        likelihood: 'high',
        category: 'failure_modes',
      },
    ];
    expect(deriveVerdict(c).verdict).toBe('DESCOPE');
  });

  it('returns DESCOPE when two market verdicts are weak', () => {
    const c = base();
    c.marketSkeptic.whyWin.verdict = 'weak';
    c.marketSkeptic.featureVsProduct.verdict = 'weak';
    expect(deriveVerdict(c).verdict).toBe('DESCOPE');
  });

  it('returns PROCEED when no critical items and <2 weak verdicts', () => {
    expect(deriveVerdict(base()).verdict).toBe('PROCEED');
  });
});
