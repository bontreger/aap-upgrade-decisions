import type { CurrentDeployment, DeploymentMethod, OsOption } from '../types/wizard';

export const OS_LABELS: Record<OsOption, string> = {
  'rhel-8': 'RHEL 8',
  'rhel-9': 'RHEL 9',
  'rhel-10': 'RHEL 10',
  'ocp-before-4.12': 'OpenShift before 4.12',
  'ocp-4.12-4.13': 'OpenShift 4.12–4.13',
  'ocp-4.14-4.20': 'OpenShift 4.14–4.20',
  'ocp-4.21-plus': 'OpenShift 4.21+',
};

const RHEL_OPTIONS: OsOption[] = ['rhel-8', 'rhel-9', 'rhel-10'];
const OCP_OPTIONS: OsOption[] = [
  'ocp-before-4.12',
  'ocp-4.12-4.13',
  'ocp-4.14-4.20',
  'ocp-4.21-plus',
];
export const ALL_OS_OPTIONS: OsOption[] = [...RHEL_OPTIONS, ...OCP_OPTIONS];

const CURRENT_ENABLED: Record<CurrentDeployment, OsOption[]> = {
  rpm: ['rhel-8', 'rhel-9'],
  containerized: ['rhel-9', 'rhel-10'],
  openshift: OCP_OPTIONS,
};

const TARGET_ENABLED: Record<DeploymentMethod, OsOption[] | null> = {
  rpm: ['rhel-9'],
  containerized: ['rhel-9', 'rhel-10'],
  openshift: null,
  managed: null,
};

export function isOsEnabledForCurrent(
  deployment: CurrentDeployment | null,
  os: OsOption
): boolean {
  if (!deployment) return false;
  return CURRENT_ENABLED[deployment].includes(os);
}

export function isOsEnabledForTarget(
  deployment: DeploymentMethod | null,
  os: OsOption
): boolean {
  if (!deployment) return false;
  const enabled = TARGET_ENABLED[deployment];
  if (enabled === null) return false;
  return enabled.includes(os);
}

export function shouldShowTargetOs(deployment: DeploymentMethod | null): boolean {
  return deployment === 'rpm' || deployment === 'containerized';
}

export function osDisabledReason(
  context: 'current' | 'target',
  deployment: CurrentDeployment | DeploymentMethod | null
): string {
  if (!deployment) return 'Select a deployment method first';
  if (context === 'current') {
    if (deployment === 'rpm') return 'Not supported for RPM deployments';
    if (deployment === 'containerized') return 'Not supported for containerized deployments';
    return 'Not applicable for OpenShift deployments';
  }
  if (deployment === 'rpm') return 'RPM targets require RHEL 9';
  return 'Not supported for this target deployment type';
}
