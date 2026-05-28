export type DeploymentMethod = 'rpm' | 'containerized' | 'openshift' | 'managed';
export type CurrentDeployment = 'rpm' | 'containerized' | 'openshift';
export type CurrentVersion = 'pre-2.4' | '2.4' | '2.5' | '2.6';
export type TargetVersion = '2.6' | '2.7-plus' | 'unknown';
export type OsOption =
  | 'rhel-8'
  | 'rhel-9'
  | 'rhel-10'
  | 'ocp-before-4.12'
  | 'ocp-4.12-4.13'
  | 'ocp-4.14-4.20'
  | 'ocp-4.21-plus';
export type DatabaseManagement = 'ansible-managed' | 'external';
export type PostgresVersion = '13' | '15' | 'gt15';

export type MethodologyId =
  | 'documented-upgrade'
  | 'documented-migrate'
  | 'api-bridge'
  | 'managed-service-ticket'
  | 'greenfield';

export type ChangeType =
  | 'os'
  | 'version'
  | 'deployment'
  | 'in-place-upgrade'
  | 'managed-onboard'
  | 'greenfield'
  | 'cutover';

export type InstanceRole = 'source' | 'interim' | 'target';

export type CaveatId =
  | 'sso'
  | 'mesh'
  | 'hub'
  | 'eda'
  | 'gateway'
  | 'credentials-no-vault'
  | 'job-history'
  | 'org-rbac'
  | 'smart-inventories'
  | 'custom-cred-types'
  | 'air-gapped';

export interface WizardAnswers {
  current: {
    deployment: CurrentDeployment | null;
    version: CurrentVersion | null;
    os: OsOption | null;
    database: DatabaseManagement | null;
    postgres: PostgresVersion | null;
  };
  target: {
    deployment: DeploymentMethod | null;
    version: TargetVersion | null;
    os: OsOption | null;
    database: DatabaseManagement | null;
  };
  considerations: {
    iacManaged: boolean;
    platformLowValue: boolean;
    easyVmProvisioning: boolean;
    canStandUpInterim: boolean;
    multiTenantPiecemeal: boolean;
    requireRedHatSupported: boolean;
    caveats: Partial<Record<CaveatId, boolean>>;
  };
}

export const EMPTY_ANSWERS: WizardAnswers = {
  current: {
    deployment: null,
    version: null,
    os: null,
    database: null,
    postgres: null,
  },
  target: {
    deployment: null,
    version: null,
    os: null,
    database: null,
  },
  considerations: {
    iacManaged: false,
    platformLowValue: false,
    easyVmProvisioning: false,
    canStandUpInterim: false,
    multiTenantPiecemeal: false,
    requireRedHatSupported: false,
    caveats: {},
  },
};

export interface DocRef {
  label: string;
  href: string;
}

export interface UpgradeStage {
  id: string;
  title: string;
  description: string;
  changeType: ChangeType;
  requiresNewInstance: boolean;
  instanceRole: InstanceRole;
  docRefs: DocRef[];
  methodology?: MethodologyId;
}

export interface RecommendationResult {
  overallMethodology: MethodologyId;
  runnerUp?: MethodologyId;
  stages: UpgradeStage[];
  interimInstanceCount: number;
  bridgeApplicable: boolean;
  justification: string[];
  alternatives: string[];
  triggeredCaveats: { id: CaveatId; title: string; severity: string; impact: string }[];
  storylineNotes: string[];
}
