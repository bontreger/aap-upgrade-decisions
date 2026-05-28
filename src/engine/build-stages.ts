import { refs } from '../data/doc-links';
import type {
  CurrentDeployment,
  CurrentVersion,
  DeploymentMethod,
  TargetVersion,
  UpgradeStage,
  WizardAnswers,
} from '../types/wizard';

function versionOrder(v: CurrentVersion): number {
  const map: Record<CurrentVersion, number> = {
    'pre-2.4': 0,
    '2.4': 1,
    '2.5': 2,
    '2.6': 3,
  };
  return map[v];
}

function needsVersionStair(current: CurrentVersion, target: TargetVersion): boolean {
  if (target === 'unknown') return versionOrder(current) < versionOrder('2.6');
  if (target === '2.7-plus') return versionOrder(current) < versionOrder('2.6');
  return versionOrder(current) < versionOrder('2.6');
}

function deploymentChanged(
  current: CurrentDeployment,
  target: DeploymentMethod
): boolean {
  if (target === 'managed') return current !== 'containerized';
  return current !== target;
}

export function buildUpgradeStages(answers: WizardAnswers): UpgradeStage[] {
  const { current, target } = answers;
  if (!current.deployment || !current.version || !target.deployment) {
    return [];
  }

  const stages: UpgradeStage[] = [];

  const addInterim = (
    id: string,
    title: string,
    description: string,
    changeType: UpgradeStage['changeType'],
    docKeys: Parameters<typeof refs>[0][]
  ) => {
    stages.push({
      id,
      title,
      description,
      changeType,
      requiresNewInstance: true,
      instanceRole: 'interim',
      docRefs: refs(...docKeys),
    });
  };

  if (answers.considerations.iacManaged || answers.considerations.platformLowValue) {
    stages.push({
      id: 'greenfield',
      title: 'Greenfield target deployment',
      description:
        'Install the target platform and apply configuration from Infrastructure-as-Code or templates. No migration from the source platform is required.',
      changeType: 'greenfield',
      requiresNewInstance: true,
      instanceRole: 'target',
      docRefs: refs('install', 'plan'),
    });
    return stages;
  }

  if (target.deployment === 'managed') {
    stages.push({
      id: 'managed-onboard',
      title: 'Managed service onboarding',
      description:
        'Engage Red Hat support to onboard to Managed Ansible Automation Platform (AWS/Azure). Customer self-migration is not the default path.',
      changeType: 'managed-onboard',
      requiresNewInstance: true,
      instanceRole: 'target',
      docRefs: refs('plan', 'blog'),
    });
    return stages;
  }

  if (current.os === 'rhel-8') {
    stages.push({
      id: 'os-rhel8-rhel9',
      title: 'Migrate hosts from RHEL 8 to RHEL 9',
      description:
        'RHEL 8 is unsupported for AAP 2.6. Rebuild or migrate underlying hosts to RHEL 9 before upgrading the platform (host-level change; may not require a separate AAP instance if done in place on the same topology).',
      changeType: 'os',
      requiresNewInstance: false,
      instanceRole: 'source',
      docRefs: refs('upgrade', 'plan'),
    });
  }

  if (current.version === 'pre-2.4' && needsVersionStair(current.version, target.version ?? '2.6')) {
    addInterim(
      'version-2.4',
      'Reach Ansible Automation Platform 2.4',
      'Database-centric paths require AAP 2.4+ before proceeding to 2.6. This often means an interim platform on RHEL 9.',
      'version',
      ['upgrade', 'plan']
    );
  }

  if (
    current.deployment !== 'openshift' &&
    target.deployment === 'openshift'
  ) {
    addInterim(
      'deploy-to-ocp',
      'Replatform to OpenShift',
      'Move to OpenShift Container Platform early, then perform subsequent version upgrades within the cluster via the operator.',
      'deployment',
      ['migrate', 'upgrade']
    );
  } else if (
    deploymentChanged(current.deployment, target.deployment) &&
    !(current.deployment === 'openshift' && target.deployment === 'openshift')
  ) {
    const targetLabel =
      target.deployment === 'containerized' ? 'containerized' : target.deployment;
    addInterim(
      `deploy-to-${target.deployment}`,
      `Replatform to ${targetLabel} deployment`,
      `Change deployment method from ${current.deployment} to ${target.deployment}. Requires a new platform instance and documented migration workflow.`,
      'deployment',
      ['migrate', 'plan']
    );
  }

  if (
    needsVersionStair(current.version, target.version ?? '2.6') &&
    current.version !== 'pre-2.4'
  ) {
    const inPlace =
      !deploymentChanged(current.deployment, target.deployment) &&
      current.os !== 'rhel-8';
    stages.push({
      id: 'version-to-2.6',
      title: 'Upgrade to Ansible Automation Platform 2.6',
      description: inPlace
        ? 'Supported in-place upgrade on the same deployment topology (pass-through release for future versions).'
        : 'Upgrade product version on the interim or target topology.',
      changeType: 'in-place-upgrade',
      requiresNewInstance: !inPlace,
      instanceRole: inPlace ? 'source' : 'interim',
      docRefs: refs('upgrade'),
    });
  }

  if (target.version === '2.7-plus' && current.deployment === 'rpm') {
    stages.push({
      id: 'replatform-before-27',
      title: 'Replatform before AAP 2.7',
      description:
        'RPM is not supported for AAP 2.7+. Migrate to containerized or OpenShift before targeting 2.7+.',
      changeType: 'deployment',
      requiresNewInstance: true,
      instanceRole: 'interim',
      docRefs: refs('migrate', 'plan'),
    });
  }

  if (stages.length === 0 || stages.every((s) => s.changeType === 'os' && !s.requiresNewInstance)) {
    const sameTopology =
      !deploymentChanged(current.deployment, target.deployment) &&
      current.version === '2.5' &&
      (target.version === '2.6' || target.version === 'unknown');
    if (sameTopology || (current.version === '2.6' && target.version === '2.6')) {
      stages.push({
        id: 'in-place-2.5-2.6',
        title: 'In-place upgrade to AAP 2.6',
        description:
          'Supported upgrade on the same deployment method and OS band. Use official upgrade documentation; aap-bridge is not applicable.',
        changeType: 'in-place-upgrade',
        requiresNewInstance: false,
        instanceRole: 'source',
        docRefs: refs('upgrade'),
      });
    }
  }

  if (current.deployment === 'openshift' && target.deployment === 'openshift') {
    const hasOcpUpgrade = stages.some((s) => s.id.includes('ocp') || s.changeType === 'in-place-upgrade');
    if (!hasOcpUpgrade) {
      stages.push({
        id: 'ocp-operator-upgrade',
        title: 'Operator upgrade within OpenShift',
        description:
          'Patch or upgrade the Ansible Automation Platform operator on the existing cluster. No separate migration platform required.',
        changeType: 'in-place-upgrade',
        requiresNewInstance: false,
        instanceRole: 'source',
        docRefs: refs('upgrade'),
      });
    }
  }

  stages.push({
    id: 'cutover',
    title: 'Cutover and validation',
    description:
      'Validate the target environment, redirect integrations and automation to the new platform, and decommission interim instances when applicable.',
    changeType: 'cutover',
    requiresNewInstance: false,
    instanceRole: 'target',
    docRefs: refs('migrate', 'plan'),
  });

  return stages;
}
