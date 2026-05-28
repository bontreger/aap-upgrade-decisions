import type { UpgradeStage, WizardAnswers } from '../types/wizard';

export function countInterimInstances(stages: UpgradeStage[]): number {
  return stages.filter((s) => s.requiresNewInstance && s.instanceRole === 'interim').length;
}

export function anyStageRequiresNewInstance(stages: UpgradeStage[]): boolean {
  return stages.some((s) => s.requiresNewInstance);
}

export function buildStorylineNotes(answers: WizardAnswers, stages: UpgradeStage[]): string[] {
  const notes: string[] = [];
  const count = countInterimInstances(stages);

  if (count > 0) {
    notes.push(
      `This path likely requires ${count} additional AAP instance(s) beyond production (interim staging platforms for cutover).`
    );
  } else {
    notes.push(
      'No additional AAP platform instance is required for this path; use official in-place upgrade documentation.'
    );
  }

  if (answers.current.os === 'rhel-8') {
    notes.push(
      'RHEL 8 is not supported for Ansible Automation Platform 2.6. Operating system must reach RHEL 9+ before or as part of the upgrade journey.'
    );
  }

  if (answers.current.deployment === 'rpm') {
    notes.push(
      'RPM-based deployments frequently require multiple stages because the installer changes only one dimension (OS, version, or deployment method) at a time.'
    );
  }

  if (
    answers.current.deployment !== 'openshift' &&
    answers.target.deployment === 'openshift'
  ) {
    notes.push(
      'Replatform to OpenShift as early as practical, then perform version upgrades within the cluster using the operator—not as a final hop after other migration paths.'
    );
  }

  if (answers.current.deployment === 'openshift') {
    notes.push('Upgrade within OpenShift using operator-based upgrade documentation.');
  }

  return notes;
}
