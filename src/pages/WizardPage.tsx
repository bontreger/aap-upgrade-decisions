import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  PageSection,
  PageSectionVariants,
  Title,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { BRIDGE_CAVEATS } from '../data/bridge-caveats';
import {
  ALL_OS_OPTIONS,
  isOsEnabledForCurrent,
  isOsEnabledForTarget,
  OS_LABELS,
  osDisabledReason,
  shouldShowTargetOs,
} from '../data/os-compatibility';
import { useWizard } from '../context/WizardContext';
import { isWizardComplete } from '../engine/recommend';
import { RadioFieldGroup } from '../components/RadioFieldGroup';
import { CheckboxField } from '../components/CheckboxField';
import type {
  CaveatId,
  CurrentDeployment,
  CurrentVersion,
  DatabaseManagement,
  DeploymentMethod,
  OsOption,
  PostgresVersion,
  TargetVersion,
} from '../types/wizard';

const CURRENT_DEPLOYMENTS: { value: CurrentDeployment; label: string }[] = [
  { value: 'rpm', label: 'RPM' },
  { value: 'containerized', label: 'Containerized' },
  { value: 'openshift', label: 'OpenShift' },
];

const CURRENT_VERSIONS: { value: CurrentVersion; label: string }[] = [
  { value: 'pre-2.4', label: 'Older than 2.4' },
  { value: '2.4', label: '2.4' },
  { value: '2.5', label: '2.5' },
  { value: '2.6', label: '2.6' },
];

const TARGET_DEPLOYMENTS: { value: DeploymentMethod; label: string }[] = [
  { value: 'rpm', label: 'RPM' },
  { value: 'containerized', label: 'Containerized' },
  { value: 'openshift', label: 'OpenShift' },
  { value: 'managed', label: 'Managed service (AWS / Azure)' },
];

const TARGET_VERSIONS: { value: TargetVersion; label: string }[] = [
  { value: '2.6', label: '2.6' },
  { value: '2.7-plus', label: '2.7+' },
  { value: 'unknown', label: 'Unknown' },
];

const DATABASE_OPTIONS: { value: DatabaseManagement; label: string }[] = [
  { value: 'ansible-managed', label: 'Ansible-managed' },
  { value: 'external', label: 'Externally-provided' },
];

const POSTGRES_OPTIONS: { value: PostgresVersion; label: string }[] = [
  { value: '13', label: 'PostgreSQL 13' },
  { value: '15', label: 'PostgreSQL 15' },
  { value: 'gt15', label: 'Greater than 15' },
];

export function WizardPage() {
  const navigate = useNavigate();
  const { answers, setAnswers } = useWizard();
  const complete = useMemo(() => isWizardComplete(answers), [answers]);

  const showPostgres =
    answers.current.deployment === 'rpm' &&
    (answers.current.version === 'pre-2.4' || answers.current.version === '2.4');

  const currentOsOptions = useMemo(
    () =>
      ALL_OS_OPTIONS.map((os) => ({
        value: os,
        label: OS_LABELS[os],
        disabled: !isOsEnabledForCurrent(answers.current.deployment, os),
        disabledReason: osDisabledReason('current', answers.current.deployment),
      })),
    [answers.current.deployment]
  );

  const targetOsOptions = useMemo(
    () =>
      ALL_OS_OPTIONS.map((os) => ({
        value: os,
        label: OS_LABELS[os],
        disabled: !isOsEnabledForTarget(answers.target.deployment, os),
        disabledReason: osDisabledReason('target', answers.target.deployment),
      })),
    [answers.target.deployment]
  );

  const targetVersionOptions = TARGET_VERSIONS.map((v) => ({
    ...v,
    disabled: answers.target.deployment === 'rpm' && v.value === '2.7-plus',
    disabledReason:
      answers.target.deployment === 'rpm' ? 'RPM targets only support 2.6' : undefined,
  }));

  const setCaveat = (id: CaveatId, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      considerations: {
        ...prev.considerations,
        caveats: { ...prev.considerations.caveats, [id]: checked },
      },
    }));
  };

  return (
    <PageSection variant={PageSectionVariants.default}>
      <Title headingLevel="h1" size="2xl">
        AAP Upgrade Path Assessment
      </Title>
      <p style={{ marginBottom: '1.5rem', maxWidth: '52rem' }}>
        Capture the customer&apos;s current and target Ansible Automation Platform
        environment, then receive a recommended upgrade methodology, staged path, and
        migration caveats.
      </p>

      <Wizard>
        <WizardStep id="current" name="Current environment">
          <Form>
            <RadioFieldGroup
              label="Deployment method"
              fieldId="current-deployment"
              isRequired
              value={answers.current.deployment}
              options={CURRENT_DEPLOYMENTS}
              onChange={(v) =>
                setAnswers((p) => ({
                  ...p,
                  current: {
                    ...p.current,
                    deployment: v,
                    os: isOsEnabledForCurrent(v, p.current.os as OsOption)
                      ? p.current.os
                      : null,
                  },
                }))
              }
            />
            <RadioFieldGroup
              label="AAP version"
              fieldId="current-version"
              isRequired
              value={answers.current.version}
              options={CURRENT_VERSIONS}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, current: { ...p.current, version: v } }))
              }
            />
            <RadioFieldGroup
              label="Underlying OS"
              fieldId="current-os"
              isRequired
              value={answers.current.os}
              options={currentOsOptions}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, current: { ...p.current, os: v } }))
              }
            />
            <RadioFieldGroup
              label="Database"
              fieldId="current-database"
              isRequired
              value={answers.current.database}
              options={DATABASE_OPTIONS}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, current: { ...p.current, database: v } }))
              }
            />
            {showPostgres && (
              <RadioFieldGroup
                label="PostgreSQL version (RPM, AAP 2.4 or older)"
                fieldId="current-postgres"
                isRequired
                value={answers.current.postgres}
                options={POSTGRES_OPTIONS}
                onChange={(v) =>
                  setAnswers((p) => ({ ...p, current: { ...p.current, postgres: v } }))
                }
              />
            )}
          </Form>
        </WizardStep>

        <WizardStep id="target" name="Target environment">
          <Form>
            <RadioFieldGroup
              label="Deployment method"
              fieldId="target-deployment"
              isRequired
              value={answers.target.deployment}
              options={TARGET_DEPLOYMENTS}
              onChange={(v) =>
                setAnswers((p) => ({
                  ...p,
                  target: {
                    ...p.target,
                    deployment: v,
                    os: shouldShowTargetOs(v)
                      ? isOsEnabledForTarget(v, p.target.os as OsOption)
                        ? p.target.os
                        : null
                      : null,
                    version:
                      v === 'rpm' && p.target.version === '2.7-plus' ? '2.6' : p.target.version,
                  },
                }))
              }
            />
            <RadioFieldGroup
              label="AAP version"
              fieldId="target-version"
              isRequired
              value={answers.target.version}
              options={targetVersionOptions}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, target: { ...p.target, version: v } }))
              }
            />
            {shouldShowTargetOs(answers.target.deployment) && (
              <RadioFieldGroup
                label="Underlying OS"
                fieldId="target-os"
                isRequired
                value={answers.target.os}
                options={targetOsOptions}
                onChange={(v) =>
                  setAnswers((p) => ({ ...p, target: { ...p.target, os: v } }))
                }
              />
            )}
            <RadioFieldGroup
              label="Database"
              fieldId="target-database"
              isRequired
              value={answers.target.database}
              options={DATABASE_OPTIONS}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, target: { ...p.target, database: v } }))
              }
            />
          </Form>
        </WizardStep>

        <WizardStep id="considerations" name="Customer considerations">
          <Form>
            <Title headingLevel="h3" size="md">
              Platform and migration posture
            </Title>
            <CheckboxField
              fieldId="iac"
              label="AAP configuration managed as Infrastructure-as-Code"
              isChecked={answers.considerations.iacManaged}
              onChange={(c) =>
                setAnswers((p) => ({
                  ...p,
                  considerations: { ...p.considerations, iacManaged: c },
                }))
              }
            />
            <CheckboxField
              fieldId="low-value"
              label="Existing platform is of little operational value (acceptable to rebuild)"
              isChecked={answers.considerations.platformLowValue}
              onChange={(c) =>
                setAnswers((p) => ({
                  ...p,
                  considerations: { ...p.considerations, platformLowValue: c },
                }))
              }
            />
            <CheckboxField
              fieldId="easy-vm"
              label="New VMs / infrastructure are easy to provision"
              isChecked={answers.considerations.easyVmProvisioning}
              onChange={(c) =>
                setAnswers((p) => ({
                  ...p,
                  considerations: { ...p.considerations, easyVmProvisioning: c },
                }))
              }
            />
            <CheckboxField
              fieldId="interim"
              label="Team can stand up intermediate AAP environments"
              isChecked={answers.considerations.canStandUpInterim}
              onChange={(c) =>
                setAnswers((p) => ({
                  ...p,
                  considerations: { ...p.considerations, canStandUpInterim: c },
                }))
              }
            />
            <CheckboxField
              fieldId="piecemeal"
              label="Multi-tenant: not all tenants can migrate at the same time"
              description="Requires aap-bridge for piecemeal movement"
              isChecked={answers.considerations.multiTenantPiecemeal}
              onChange={(c) =>
                setAnswers((p) => ({
                  ...p,
                  considerations: { ...p.considerations, multiTenantPiecemeal: c },
                }))
              }
            />
            <CheckboxField
              fieldId="supported"
              label="Strong requirement for Red Hat–supported methodology"
              isChecked={answers.considerations.requireRedHatSupported}
              onChange={(c) =>
                setAnswers((p) => ({
                  ...p,
                  considerations: { ...p.considerations, requireRedHatSupported: c },
                }))
              }
            />

            <Title headingLevel="h3" size="md" style={{ marginTop: '1.5rem' }}>
              aap-bridge risk factors
            </Title>
            {BRIDGE_CAVEATS.map((c) => (
              <CheckboxField
                key={c.id}
                fieldId={`caveat-${c.id}`}
                label={c.questionLabel}
                isChecked={!!answers.considerations.caveats[c.id]}
                onChange={(checked) => setCaveat(c.id, checked)}
              />
            ))}
          </Form>
        </WizardStep>

        <WizardStep id="review" name="Review">
          <p>
            {complete
              ? 'All required questions are answered. Generate your upgrade report.'
              : 'Complete all required fields in previous steps before generating the report.'}
          </p>
          <Button
            variant="primary"
            isDisabled={!complete}
            onClick={() => navigate('/report')}
          >
            View upgrade report
          </Button>
        </WizardStep>
      </Wizard>
    </PageSection>
  );
}
