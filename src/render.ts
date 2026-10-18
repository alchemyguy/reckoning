import type { CriticalAnalysis, CriticalItem, MarketSkepticVerdict } from './schemas/critical';
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

// Field values are markdown and often multi-line bullet lists, so every line is
// indented to stay nested under its list item.
function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => (line ? `  ${line}` : line))
    .join('\n');
}

// Without `praise` this renders a critic-only pre-mortem (no strengths sections).
export function renderVerdict(critical: CriticalAnalysis, praise?: PraiseAnalysis): string {
  const { verdict, reason } = deriveVerdict(critical);
  const lines: string[] = [];

  const heading = praise ? 'Reckoning Verdict' : 'Reckoning Pre-mortem';
  lines.push(`# ${heading} — ${critical.projectId} (${critical.prdVersion})`);
  lines.push('');
  lines.push(`## ⚖️ Verdict: ${verdict}`);
  lines.push(reason);
  lines.push('');

  if (praise) {
    lines.push('## ✅ Strengths');
    const strengths = [...praise.strengths].sort(
      (a, b) => STRENGTH_RANK[a.strengthLevel] - STRENGTH_RANK[b.strengthLevel],
    );
    for (const s of strengths) {
      const badge = s.doNotRegress ? ' · 🔒 DO NOT REGRESS' : '';
      lines.push(`- **${s.title}** [${s.strengthLevel}]${badge} — §${s.prdSectionId}`);
      lines.push(indent(s.whyItWorks));
    }
    lines.push('');

    if (praise.nonObviousInsights.length > 0) {
      lines.push('## 💡 Non-obvious insights');
      for (const n of praise.nonObviousInsights) {
        lines.push(`- **${n.title}** — §${n.prdSectionId}`);
        lines.push(indent(n.detail));
        lines.push(indent(`_Why it's non-obvious:_\n${n.whyNonObvious}`));
      }
      lines.push('');
    }
  }

  lines.push('## 🔴 Failure modes (by severity)');
  const items = [...allItems(critical)].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
  for (const i of items) {
    lines.push(`- **[${i.severity}/${i.likelihood}] ${i.title}** (${i.category} · §${i.prdSectionId})`);
    lines.push(indent(i.consequence));
  }
  lines.push('');

  lines.push('## 🧭 Market skeptic');
  const ms = critical.marketSkeptic;
  const questions: [string, MarketSkepticVerdict][] = [
    ['Why care?', ms.whyCare],
    ['Why now?', ms.whyNow],
    ['Why win?', ms.whyWin],
    ['Feature or product?', ms.featureVsProduct],
  ];
  for (const [label, v] of questions) {
    lines.push(`- **${label}** [${v.verdict}]`);
    lines.push(indent(v.detail));
  }
  lines.push('');

  lines.push('## 📋 Overall');
  lines.push(critical.overallAssessment);
  lines.push('');
  lines.push(`- **Kill recommendation:** ${critical.killRecommendation.kill ? 'yes' : 'no'}`);
  lines.push(indent(critical.killRecommendation.rationale));
  if (praise) {
    lines.push('- **Strongest case for it:**');
    lines.push(indent(praise.overallAssessment));
  }
  lines.push('');
  lines.push(
    praise
      ? `_Critic confidence: ${critical.confidence} · Praise confidence: ${praise.confidence}_`
      : `_Critic confidence: ${critical.confidence}_`,
  );

  return lines.join('\n');
}
