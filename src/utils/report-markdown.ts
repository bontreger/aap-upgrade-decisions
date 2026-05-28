import { getMethodology } from '../data/methodologies';
import { DOC_LINKS } from '../data/doc-links';
import type { RecommendationResult, WizardAnswers } from '../types/wizard';
import { OS_LABELS } from '../data/os-compatibility';

function label<T extends string>(v: T | null, map: Record<string, string>): string {
  return v ? (map[v] ?? v) : '—';
}

export function buildReportMarkdown(
  answers: WizardAnswers,
  result: RecommendationResult
): string {
  const m = getMethodology(result.overallMethodology);
  const lines: string[] = [
    '# AAP Upgrade Path Recommendation',
    '',
    '## Executive summary',
    `**Recommended approach:** ${m.name}`,
    `**Interim AAP instances likely required:** ${result.interimInstanceCount}`,
    `**aap-bridge applicable:** ${result.bridgeApplicable ? 'Yes (for stages with new instances)' : 'No — use official documentation only'}`,
    '',
    '## Environment snapshot',
    '',
    '| | Current | Target |',
    '|---|---------|--------|',
    `| Deployment | ${answers.current.deployment ?? '—'} | ${answers.target.deployment ?? '—'} |`,
    `| AAP version | ${answers.current.version ?? '—'} | ${answers.target.version ?? '—'} |`,
    `| OS | ${label(answers.current.os, OS_LABELS)} | ${label(answers.target.os, OS_LABELS)} |`,
    `| Database | ${answers.current.database ?? '—'} | ${answers.target.database ?? '—'} |`,
    '',
    '## Upgrade storyline',
    '',
    ...result.storylineNotes.map((n) => `- ${n}`),
    '',
    '## Staged plan',
    '',
  ];

  result.stages.forEach((stage, i) => {
    const method = stage.methodology
      ? getMethodology(stage.methodology).shortName
      : '—';
    lines.push(
      `### ${i + 1}. ${stage.title}`,
      `- ${stage.description}`,
      `- New instance required: ${stage.requiresNewInstance ? 'Yes' : 'No'}`,
      `- Methodology for this stage: ${method}`,
      ''
    );
  });

  lines.push('## Justification', '', ...result.justification.map((j) => `- ${j}`), '');

  if (result.alternatives.length) {
    lines.push('## Alternatives', '', ...result.alternatives.map((a) => `- ${a}`), '');
  }

  if (result.triggeredCaveats.length) {
    lines.push('## Migration caveats (aap-bridge)', '');
    result.triggeredCaveats.forEach((c) => {
      lines.push(`- **${c.title}** (${c.severity}): ${c.impact}`);
    });
    lines.push('');
  }

  lines.push('## References', '');
  Object.values(DOC_LINKS).forEach((d) => {
    lines.push(`- [${d.label}](${d.href})`);
  });

  return lines.join('\n');
}
