import type { CriticalAnalysis, CriticalItem } from './schemas/critical';
import type { PraiseAnalysis } from './schemas/praise';
import { deriveVerdict, allItems } from './verdict';

const SEVERITY_RANK: Record<CriticalItem['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STRENGTH_RANK: Record<PraiseAnalysis['strengths'][number]['strengthLevel'], number> = {
  strong: 0,
  notable: 1,
  solid: 2,
};

export function renderVerdict(critical: CriticalAnalysis, praise: PraiseAnalysis): string {
  const { verdict, reason } = deriveVerdict(critical);
  const lines: string[] = [];

  lines.push(`# Reckoning Verdict — ${critical.projectId} (${critical.prdVersion})`);
  lines.push('');
  lines.push(`## ⚖️ Verdict: ${verdict}`);
  lines.push(reason);
  lines.push('');

  lines.push('## ✅ Strengths');
  const strengths = [...praise.strengths].sort(
    (a, b) => STRENGTH_RANK[a.strengthLevel] - STRENGTH_RANK[b.strengthLevel],
  );
  for (const s of strengths) {
    const badge = s.doNotRegress ? ' · 🔒 DO NOT REGRESS' : '';
    lines.push(`- **${s.title}** [${s.strengthLevel}]${badge} — §${s.prdSectionId}`);
    lines.push(`  ${s.whyItWorks}`);
  }
  lines.push('');

  if (praise.nonObviousInsights.length > 0) {
    lines.push('## 💡 Non-obvious insights');
    for (const n of praise.nonObviousInsights) {
      lines.push(`- **${n.title}** — §${n.prdSectionId}`);
      lines.push(`  ${n.detail}`);
      lines.push(`  _Why it's non-obvious:_ ${n.whyNonObvious}`);
    }
    lines.push('');
  }

  lines.push('## 🔴 Failure modes (by severity)');
  const items = [...allItems(critical)].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
  for (const i of items) {
    lines.push(`- **[${i.severity}/${i.likelihood}] ${i.title}** (${i.category} · §${i.prdSectionId})`);
    lines.push(`  ${i.consequence}`);
  }
  lines.push('');

  lines.push('## 🧭 Market skeptic');
  const ms = critical.marketSkeptic;
  lines.push(`- **Why care?** [${ms.whyCare.verdict}] ${ms.whyCare.detail}`);
  lines.push(`- **Why now?** [${ms.whyNow.verdict}] ${ms.whyNow.detail}`);
  lines.push(`- **Why win?** [${ms.whyWin.verdict}] ${ms.whyWin.detail}`);
  lines.push(`- **Feature or product?** [${ms.featureVsProduct.verdict}] ${ms.featureVsProduct.detail}`);
  lines.push('');

  lines.push('## 📋 Overall');
  lines.push(critical.overallAssessment);
  lines.push('');
  lines.push(
    `_Critic confidence: ${critical.confidence} · Praise confidence: ${praise.confidence}_`,
  );

  return lines.join('\n');
}
