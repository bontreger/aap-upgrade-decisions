import { BRIDGE_CAVEATS } from '../data/bridge-caveats';
import { getMethodology } from '../data/methodologies';
import { buildUpgradeStages } from './build-stages';
import {
  anyStageRequiresNewInstance,
  buildStorylineNotes,
  countInterimInstances,
} from './detect-interim';
import type {
  MethodologyId,
  RecommendationResult,
  UpgradeStage,
  WizardAnswers,
} from '../types/wizard';

function countHighCaveats(answers: WizardAnswers): number {
  return BRIDGE_CAVEATS.filter(
    (c) => c.severity === 'high' && answers.considerations.caveats[c.id]
  ).length;
}

function getTriggeredCaveats(answers: WizardAnswers) {
  return BRIDGE_CAVEATS.filter((c) => answers.considerations.caveats[c.id]).map((c) => ({
    id: c.id,
    title: c.title,
    severity: c.severity,
    impact: c.impact,
  }));
}

function pickStageMethodology(
  stage: UpgradeStage,
  answers: WizardAnswers,
  overall: MethodologyId
): MethodologyId {
  if (overall === 'greenfield' || overall === 'managed-service-ticket') {
    return overall;
  }
  if (stage.changeType === 'greenfield') return 'greenfield';
  if (stage.changeType === 'managed-onboard') return 'managed-service-ticket';

  if (!stage.requiresNewInstance) {
    return 'documented-upgrade';
  }

  if (answers.considerations.multiTenantPiecemeal) {
    return 'api-bridge';
  }

  if (answers.considerations.requireRedHatSupported) {
    return 'documented-migrate';
  }

  const highCaveats = countHighCaveats(answers);
  if (highCaveats >= 4) {
    return 'documented-migrate';
  }

  return 'documented-migrate';
}

function pickOverallMethodology(
  answers: WizardAnswers,
  stages: UpgradeStage[]
): { primary: MethodologyId; runnerUp?: MethodologyId } {
  if (answers.target.deployment === 'managed') {
    return { primary: 'managed-service-ticket', runnerUp: 'api-bridge' };
  }

  if (answers.considerations.iacManaged || answers.considerations.platformLowValue) {
    return { primary: 'greenfield', runnerUp: 'documented-migrate' };
  }

  if (answers.considerations.multiTenantPiecemeal) {
    return { primary: 'api-bridge', runnerUp: 'documented-migrate' };
  }

  if (!anyStageRequiresNewInstance(stages)) {
    return { primary: 'documented-upgrade' };
  }

  const needsInterim = anyStageRequiresNewInstance(stages);
  if (needsInterim && answers.considerations.requireRedHatSupported) {
    return { primary: 'documented-migrate', runnerUp: 'api-bridge' };
  }

  if (needsInterim && countHighCaveats(answers) >= 3) {
    return { primary: 'documented-migrate', runnerUp: 'api-bridge' };
  }

  if (needsInterim) {
    return { primary: 'documented-migrate', runnerUp: 'api-bridge' };
  }

  return { primary: 'documented-upgrade' };
}

function buildJustification(
  answers: WizardAnswers,
  primary: MethodologyId,
  stages: UpgradeStage[],
  interimCount: number
): string[] {
  const lines: string[] = [];
  const m = getMethodology(primary);

  lines.push(`Primary recommendation: ${m.name} — ${m.philosophy}`);

  if (answers.target.deployment === 'managed') {
    lines.push('Target is Managed Ansible Automation Platform; Red Hat support ticket onboarding is the default path.');
  }

  if (primary === 'greenfield') {
    if (answers.considerations.iacManaged) {
      lines.push('Configuration is managed as Infrastructure-as-Code, enabling a new instance without migrating legacy state.');
    }
    if (answers.considerations.platformLowValue) {
      lines.push('Existing platform has little operational value to preserve, making greenfield preferable to migration.');
    }
  }

  if (!anyStageRequiresNewInstance(stages)) {
    lines.push('No additional AAP platform instance is required; official documentation paths apply and aap-bridge is not applicable.');
  } else if (interimCount > 0) {
    lines.push(
      `${interimCount} interim platform(s) are likely required—this is where documented migrate vs aap-bridge must be decided per stage.`
    );
  }

  if (answers.considerations.multiTenantPiecemeal) {
    lines.push(
      'Multi-tenant environment cannot move all tenants at once; aap-bridge is required for piecemeal tenant/org migration.'
    );
  }

  if (primary === 'api-bridge' && countHighCaveats(answers) >= 3) {
    lines.push(
      'Note: Multiple high-impact bridge caveats apply—expect significant manual remediation even if aap-bridge is used.'
    );
  }

  if (answers.current.deployment === 'rpm') {
    lines.push('RPM source deployment increases likelihood of multi-stage paths and interim instances.');
  }

  return lines;
}

function buildAlternatives(primary: MethodologyId, answers: WizardAnswers): string[] {
  const alts: string[] = [];
  if (primary !== 'documented-migrate' && anyStageRequiresNewInstance(buildUpgradeStages(answers))) {
    alts.push(
      'Documented migrate/replatform: fully supported, preserves database fidelity, requires interim environments.'
    );
  }
  if (primary !== 'api-bridge' && answers.target.deployment !== 'managed') {
    alts.push(
      'aap-bridge: faster single-hop API migration when interim DB restore is impractical or tenants move piecemeal (community tool).'
    );
  }
  if (primary !== 'greenfield' && answers.considerations.iacManaged) {
    alts.push('Greenfield: deploy target and apply IaC if migration effort outweighs rebuild.');
  }
  if (primary !== 'managed-service-ticket' && answers.target.deployment === 'managed') {
    alts.push('Managed service ticket: always available as the supported onboarding path for managed targets.');
  }
  return alts;
}

export function isWizardComplete(answers: WizardAnswers): boolean {
  const { current, target } = answers;
  if (!current.deployment || !current.version || !current.os || !current.database) {
    return false;
  }
  if (current.deployment === 'rpm' && (current.version === 'pre-2.4' || current.version === '2.4')) {
    if (!current.postgres) return false;
  }
  if (!target.deployment || !target.version || !target.database) return false;
  if (target.deployment === 'rpm' || target.deployment === 'containerized') {
    if (!target.os) return false;
  }
  return true;
}

export function generateRecommendation(answers: WizardAnswers): RecommendationResult {
  const stages = buildUpgradeStages(answers);
  const { primary, runnerUp } = pickOverallMethodology(answers, stages);
  const interimInstanceCount = countInterimInstances(stages);
  const bridgeApplicable = anyStageRequiresNewInstance(stages);

  const stagesWithMethods = stages.map((stage) => ({
    ...stage,
    methodology: pickStageMethodology(stage, answers, primary),
  }));

  return {
    overallMethodology: primary,
    runnerUp,
    stages: stagesWithMethods,
    interimInstanceCount,
    bridgeApplicable,
    justification: buildJustification(answers, primary, stagesWithMethods, interimInstanceCount),
    alternatives: buildAlternatives(primary, answers),
    triggeredCaveats: getTriggeredCaveats(answers),
    storylineNotes: buildStorylineNotes(answers, stagesWithMethods),
  };
}
