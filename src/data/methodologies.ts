import type { MethodologyId } from '../types/wizard';

export interface Methodology {
  id: MethodologyId;
  name: string;
  shortName: string;
  philosophy: string;
  supportStatus: string;
  pros: string[];
  cons: string[];
  whenToUse: string;
}

export const METHODOLOGIES: Record<MethodologyId, Methodology> = {
  'documented-upgrade': {
    id: 'documented-upgrade',
    name: 'Documented in-place upgrade',
    shortName: 'In-place upgrade',
    philosophy: 'The database is the source of truth; upgrade on the same topology using supported paths.',
    supportStatus: 'Fully supported by Red Hat',
    pros: [
      'Preserves job history, secrets (via DB), and full platform state',
      'Official upgrade guides and installer workflows',
      'No separate migration tooling required',
    ],
    cons: [
      'Only one change (OS, version, or deployment type) per installer run',
      'May require multiple stages and interim platforms for complex paths',
    ],
    whenToUse: 'Same deployment family with a supported version/OS upgrade and no new platform instance for that stage.',
  },
  'documented-migrate': {
    id: 'documented-migrate',
    name: 'Documented migrate / replatform',
    shortName: 'Documented migrate',
    philosophy: 'Database-centric migration using installer migration artifacts and official replatform documentation.',
    supportStatus: 'Fully supported by Red Hat',
    pros: [
      'Full data fidelity including secrets when using migration artifacts',
      'Supported paths for RPM → containerized → OpenShift',
      'Preserves operational state customers depend on',
    ],
    cons: [
      'Often requires provisioning interim AAP instances',
      'Multi-step “upgrade dance” for RPM, RHEL 8, and topology changes',
      'External DB may need Postgres and ICU alignment',
    ],
    whenToUse: 'When a new or interim platform is required and customers need a supported, full-fidelity move.',
  },
  'api-bridge': {
    id: 'api-bridge',
    name: 'aap-bridge (API-centric migration)',
    shortName: 'aap-bridge',
    philosophy: 'Configuration as Code via public REST API export/import; source of truth shifts to exported definitions.',
    supportStatus: 'Community tool (redhat-cop/aap-bridge); not formally Red Hat–supported as an end-to-end migration',
    pros: [
      'Single hop to target without intermediate DB restore environments',
      'Works across many source versions and managed cloud targets',
      'Enables piecemeal multi-tenant moves when not all tenants can migrate together',
      'Text-based middle state allows cleanup before import',
    ],
    cons: [
      'Secrets, SSO, mesh, Hub, EDA, and Gateway not fully migrated',
      'Extensive manual remediation after import',
      'Requires separate tooling host, PostgreSQL state DB, and operational expertise',
    ],
    whenToUse: 'When a new/parallel instance exists, piecemeal tenant migration is required, or speed outweighs full fidelity.',
  },
  'managed-service-ticket': {
    id: 'managed-service-ticket',
    name: 'Managed service onboarding (support ticket)',
    shortName: 'Managed service ticket',
    philosophy: 'Red Hat Managed Ansible Automation Platform onboarding via support—not customer self-migration.',
    supportStatus: 'Supported managed offering workflow',
    pros: [
      'Red Hat handles database onboarding for managed AWS/Azure deployments',
      'No customer-run migration tooling on production paths',
      'Appropriate when target is the managed service offering',
    ],
    cons: [
      'Requires support ticket and Red Hat coordination',
      'Timeline depends on support engagement',
      'Self-service database upload is not the default path',
    ],
    whenToUse: 'When the target environment is Managed Ansible Automation Platform on AWS or Azure.',
  },
  greenfield: {
    id: 'greenfield',
    name: 'Greenfield deployment',
    shortName: 'Greenfield',
    philosophy: 'Deploy a new platform and apply configuration from IaC or templates; minimal migration from source.',
    supportStatus: 'Standard install documentation applies',
    pros: [
      'Simplest when configuration is already Infrastructure-as-Code',
      'Avoids migrating technical debt from a low-value legacy platform',
      'No bridge or database migration artifact complexity',
    ],
    cons: [
      'Does not preserve job history or in-platform state unless separately archived',
      'Requires mature IaC or willingness to rebuild configuration',
      'Cutover planning and validation still required',
    ],
    whenToUse: 'Strong IaC posture or when the existing platform has little operational value to preserve.',
  },
};

export function getMethodology(id: MethodologyId): Methodology {
  return METHODOLOGIES[id];
}
