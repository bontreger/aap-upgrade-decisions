import type { CaveatId } from '../types/wizard';

export interface BridgeCaveat {
  id: CaveatId;
  title: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
  questionLabel: string;
}

export const BRIDGE_CAVEATS: BridgeCaveat[] = [
  {
    id: 'sso',
    title: 'SSO / LDAP / SAML authentication',
    severity: 'high',
    impact: 'Authentication backends are not migrated via API; manual reconfiguration required before users can log in.',
    questionLabel: 'SSO, LDAP, or SAML authentication in use',
  },
  {
    id: 'mesh',
    title: 'Distributed automation mesh',
    severity: 'high',
    impact: 'Execution and hop nodes are not migrated; mesh topology must be manually recreated on the target.',
    questionLabel: 'Distributed automation mesh (execution/hop nodes)',
  },
  {
    id: 'hub',
    title: 'Private Automation Hub content',
    severity: 'high',
    impact: 'Collections, EE images, and Hub configuration are out of aap-bridge scope.',
    questionLabel: 'Private Automation Hub content (collections / EE images)',
  },
  {
    id: 'eda',
    title: 'Event-Driven Ansible',
    severity: 'high',
    impact: 'Rulebook activations, decision environments, and EDA configuration must be recreated.',
    questionLabel: 'Event-Driven Ansible in production',
  },
  {
    id: 'gateway',
    title: 'Platform Gateway / multi-service AAP 2.5+',
    severity: 'high',
    impact: 'Gateway authenticators, maps, and cross-service RBAC are not migrated.',
    questionLabel: 'AAP 2.5+ multi-service platform (Gateway, Hub, EDA together)',
  },
  {
    id: 'credentials-no-vault',
    title: 'Many credentials without external vault',
    severity: 'high',
    impact: 'Encrypted credential values export as stubs; every secret must be re-entered or re-linked.',
    questionLabel: 'Many credentials without an external secrets manager',
  },
  {
    id: 'job-history',
    title: 'Job history / audit retention',
    severity: 'medium',
    impact: 'Job and audit history are not recreated on target; archive source if compliance requires it.',
    questionLabel: 'Job history or audit trail retention required',
  },
  {
    id: 'org-rbac',
    title: 'Complex organization-level RBAC',
    severity: 'medium',
    impact: 'Organization-scoped role grants may need manual reassignment after import.',
    questionLabel: 'Complex org-level RBAC across many organizations',
  },
  {
    id: 'smart-inventories',
    title: 'Smart inventories',
    severity: 'medium',
    impact: 'Smart inventories are skipped by default; behavior must be verified post-migration.',
    questionLabel: 'Heavy use of smart inventories',
  },
  {
    id: 'custom-cred-types',
    title: 'Custom credential types',
    severity: 'medium',
    impact: 'Custom credential types must pre-exist on target or credentials are silently skipped.',
    questionLabel: 'Custom credential types in production',
  },
  {
    id: 'air-gapped',
    title: 'Disconnected / air-gapped environment',
    severity: 'high',
    impact: 'aap-bridge requires network access to source and target; disconnected sites add operational burden.',
    questionLabel: 'Disconnected or air-gapped environment',
  },
];
