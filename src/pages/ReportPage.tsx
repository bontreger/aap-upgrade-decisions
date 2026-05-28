import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import { DOC_LINKS } from '../data/doc-links';
import { getMethodology } from '../data/methodologies';
import { OS_LABELS } from '../data/os-compatibility';
import { useWizard } from '../context/WizardContext';
import { generateRecommendation, isWizardComplete } from '../engine/recommend';
import { buildReportMarkdown } from '../utils/report-markdown';

export function ReportPage() {
  const navigate = useNavigate();
  const { answers, resetAnswers } = useWizard();
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => (isWizardComplete(answers) ? generateRecommendation(answers) : null),
    [answers]
  );

  if (!isWizardComplete(answers) || !result) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <EmptyState>
          <Title headingLevel="h2" size="lg">
            Assessment incomplete
          </Title>
          <EmptyStateBody>
            Complete the wizard before viewing the upgrade report.
          </EmptyStateBody>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to wizard
          </Button>
        </EmptyState>
      </PageSection>
    );
  }

  const methodology = getMethodology(result.overallMethodology);
  const runnerUp = result.runnerUp ? getMethodology(result.runnerUp) : null;

  const handleCopy = async () => {
    const md = buildReportMarkdown(answers, result);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageSection variant={PageSectionVariants.default} className="report-printable">
      <div className="report-section">
        <Title headingLevel="h1" size="2xl">
          Upgrade recommendation report
        </Title>
        <Content component={ContentVariants.p}>
          Share this report with the customer. PDFs in this repository are authoritative for
          execution details; this tool provides decision guidance only.
        </Content>
      </div>

      <Alert
        variant={result.interimInstanceCount > 0 ? 'warning' : 'info'}
        title="Upgrade storyline"
        isInline
        className="report-section"
      >
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {result.storylineNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Alert>

      <div className="report-section">
        <Title headingLevel="h2" size="xl">
          Executive summary
        </Title>
        <Content component={ContentVariants.p}>
          <strong>Recommended approach:</strong> {methodology.name}
          <br />
          <strong>Interim AAP instances:</strong> {result.interimInstanceCount}
          <br />
          <strong>aap-bridge applicable:</strong>{' '}
          {result.bridgeApplicable
            ? 'Yes — evaluate per stage where a new instance is required'
            : 'No — use official documentation only'}
        </Content>
        {runnerUp && (
          <Content component={ContentVariants.p}>
            <strong>Runner-up:</strong> {runnerUp.name}
          </Content>
        )}
      </div>

      <div className="report-section">
        <Title headingLevel="h2" size="lg">
          Environment snapshot
        </Title>
        <table className="pf-v6-c-table pf-m-compact pf-m-grid-md">
          <thead>
            <tr>
              <th />
              <th>Current</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Deployment</td>
              <td>{answers.current.deployment}</td>
              <td>{answers.target.deployment}</td>
            </tr>
            <tr>
              <td>AAP version</td>
              <td>{answers.current.version}</td>
              <td>{answers.target.version}</td>
            </tr>
            <tr>
              <td>OS</td>
              <td>{answers.current.os ? OS_LABELS[answers.current.os] : '—'}</td>
              <td>{answers.target.os ? OS_LABELS[answers.target.os] : '—'}</td>
            </tr>
            <tr>
              <td>Database</td>
              <td>{answers.current.database}</td>
              <td>{answers.target.database}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <Title headingLevel="h2" size="lg">
          {methodology.name}
        </Title>
        <Content component={ContentVariants.p}>{methodology.philosophy}</Content>
        <Content component={ContentVariants.small}>
          Support: {methodology.supportStatus}
        </Content>
        <Title headingLevel="h3" size="md">
          Pros
        </Title>
        <ul>
          {methodology.pros.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Title headingLevel="h3" size="md">
          Cons
        </Title>
        <ul>
          {methodology.cons.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="report-section">
        <Title headingLevel="h2" size="lg">
          Staged upgrade plan
        </Title>
        {!result.bridgeApplicable && (
          <Alert
            variant="info"
            title="Official documentation path"
            isInline
            className="report-section"
          >
            No stage requires choosing aap-bridge over documented migrate/upgrade for this
            path.
          </Alert>
        )}
        <table className="pf-v6-c-table pf-m-compact stage-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>New instance?</th>
              <th>Methodology</th>
            </tr>
          </thead>
          <tbody>
            {result.stages.map((stage) => (
              <tr key={stage.id}>
                <td>
                  <strong>{stage.title}</strong>
                  <br />
                  <small>{stage.description}</small>
                </td>
                <td>{stage.requiresNewInstance ? 'Yes' : 'No'}</td>
                <td>
                  {stage.methodology
                    ? getMethodology(stage.methodology).shortName
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <Title headingLevel="h2" size="lg">
          Justification
        </Title>
        <ul>
          {result.justification.map((j) => (
            <li key={j}>{j}</li>
          ))}
        </ul>
      </div>

      {result.alternatives.length > 0 && (
        <div className="report-section">
          <Title headingLevel="h2" size="lg">
            Alternative approaches
          </Title>
          <ul>
            {result.alternatives.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {result.triggeredCaveats.length > 0 && (
        <div className="report-section">
          <Title headingLevel="h2" size="lg">
            Migration caveats (if using aap-bridge)
          </Title>
          <ul>
            {result.triggeredCaveats.map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong> ({c.severity}): {c.impact}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="report-section">
        <Title headingLevel="h2" size="lg">
          Reference documentation
        </Title>
        <ul>
          {Object.values(DOC_LINKS).map((d) => (
            <li key={d.href}>
              <a href={d.href} target="_blank" rel="noreferrer">
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="report-actions no-print">
        <Button variant="primary" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy report as Markdown'}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Print report
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            resetAnswers();
            navigate('/');
          }}
        >
          Start over
        </Button>
        <Button variant="link" onClick={() => navigate('/')}>
          Edit answers
        </Button>
      </div>
    </PageSection>
  );
}
