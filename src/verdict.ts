import type { CriticalAnalysis, CriticalItem } from './schemas/critical';

export type Verdict = 'PROCEED' | 'DESCOPE' | 'KILL';

export function allItems(critical: CriticalAnalysis): CriticalItem[] {
  return [
    ...critical.failureModes,
    ...critical.scalePain,
    ...critical.userConfusionRisks,
    ...critical.engineeringRegrets,
  ];
}

export function deriveVerdict(critical: CriticalAnalysis): { verdict: Verdict; reason: string } {
  if (critical.killRecommendation.kill) {
    return { verdict: 'KILL', reason: critical.killRecommendation.rationale };
  }

  const criticalCount = allItems(critical).filter((i) => i.severity === 'critical').length;
  const weakVerdicts = Object.values(critical.marketSkeptic).filter(
    (v) => v.verdict === 'weak',
  ).length;

  if (criticalCount >= 1 || weakVerdicts >= 2) {
    return {
      verdict: 'DESCOPE',
      reason: `${criticalCount} critical failure mode(s) and ${weakVerdicts} weak market verdict(s) — fix before building.`,
    };
  }

  return {
    verdict: 'PROCEED',
    reason: 'No critical blockers; proceed with the noted medium/low risks.',
  };
}
