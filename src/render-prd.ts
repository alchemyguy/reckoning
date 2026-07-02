import type { PRDDocument } from './schemas/prd';

export function renderPRD(prd: PRDDocument): string {
  const lines: string[] = [];
  lines.push(`# Draft PRD — ${prd.projectId} (${prd.version})`);
  lines.push('');

  for (const section of prd.sections) {
    const pct = Math.round(section.confidence * 100);
    lines.push(`## ${section.title}  _(confidence ${pct}%)_`);
    lines.push(section.content);
    for (const flag of section.flags) {
      lines.push(`> ⚠️ ${flag}`);
    }
    lines.push('');
  }

  if (prd.assumptionsExplicit.length > 0) {
    lines.push('## Explicit assumptions');
    for (const a of prd.assumptionsExplicit) lines.push(`- ${a}`);
    lines.push('');
  }

  if (prd.contradictionsFlagged.length > 0) {
    lines.push('## Contradictions flagged');
    for (const c of prd.contradictionsFlagged) lines.push(`- ${c}`);
    lines.push('');
  }

  return lines.join('\n');
}
