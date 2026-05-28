import { describe, expect, it } from 'vitest';
import { EMPTY_ANSWERS, type WizardAnswers } from '../types/wizard';
import { generateRecommendation } from './recommend';

function fill(partial: Partial<WizardAnswers>): WizardAnswers {
  return {
    ...EMPTY_ANSWERS,
    ...partial,
    current: { ...EMPTY_ANSWERS.current, ...partial.current },
    target: { ...EMPTY_ANSWERS.target, ...partial.target },
    considerations: {
      ...EMPTY_ANSWERS.considerations,
      ...partial.considerations,
      caveats: { ...EMPTY_ANSWERS.considerations.caveats, ...partial.considerations?.caveats },
    },
  };
}

describe('generateRecommendation', () => {
  it('OCP 2.5 to 2.6 uses documented upgrade without bridge', () => {
    const answers = fill({
      current: {
        deployment: 'openshift',
        version: '2.5',
        os: 'ocp-4.14-4.20',
        database: 'ansible-managed',
        postgres: null,
      },
      target: {
        deployment: 'openshift',
        version: '2.6',
        os: null,
        database: 'ansible-managed',
      },
    });
    const r = generateRecommendation(answers);
    expect(r.overallMethodology).toBe('documented-upgrade');
    expect(r.bridgeApplicable).toBe(false);
  });

  it('multi-tenant piecemeal requires api-bridge', () => {
    const answers = fill({
      current: {
        deployment: 'containerized',
        version: '2.5',
        os: 'rhel-9',
        database: 'ansible-managed',
        postgres: null,
      },
      target: {
        deployment: 'containerized',
        version: '2.6',
        os: 'rhel-9',
        database: 'ansible-managed',
      },
      considerations: { ...EMPTY_ANSWERS.considerations, multiTenantPiecemeal: true },
    });
    const r = generateRecommendation(answers);
    expect(r.overallMethodology).toBe('api-bridge');
  });

  it('managed target uses support ticket methodology', () => {
    const answers = fill({
      current: {
        deployment: 'containerized',
        version: '2.5',
        os: 'rhel-9',
        database: 'ansible-managed',
        postgres: null,
      },
      target: {
        deployment: 'managed',
        version: '2.6',
        os: null,
        database: 'external',
      },
    });
    const r = generateRecommendation(answers);
    expect(r.overallMethodology).toBe('managed-service-ticket');
  });

  it('IaC enables greenfield', () => {
    const answers = fill({
      current: {
        deployment: 'rpm',
        version: '2.4',
        os: 'rhel-8',
        database: 'ansible-managed',
        postgres: '13',
      },
      target: {
        deployment: 'containerized',
        version: '2.6',
        os: 'rhel-9',
        database: 'ansible-managed',
      },
      considerations: { ...EMPTY_ANSWERS.considerations, iacManaged: true },
    });
    const r = generateRecommendation(answers);
    expect(r.overallMethodology).toBe('greenfield');
  });

  it('RPM RHEL 8 to containerized 2.6 has interim instances', () => {
    const answers = fill({
      current: {
        deployment: 'rpm',
        version: '2.4',
        os: 'rhel-8',
        database: 'ansible-managed',
        postgres: '13',
      },
      target: {
        deployment: 'containerized',
        version: '2.6',
        os: 'rhel-9',
        database: 'ansible-managed',
      },
    });
    const r = generateRecommendation(answers);
    expect(r.interimInstanceCount).toBeGreaterThan(0);
    expect(r.bridgeApplicable).toBe(true);
  });
});
