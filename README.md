# AAP Upgrade Path Advisor

A consultant-facing web application for recommending Ansible Automation Platform (AAP) upgrade paths. It collects current and target environment facts, evaluates customer considerations, and produces a shareable report with staged upgrade steps and methodology recommendations.

Deployed to GitHub Pages: `https://<user>.github.io/aap-upgrade-decisions/`

## Methodologies

The advisor recommends among five approaches:

1. **Documented in-place upgrade** — official upgrade docs when no new platform instance is required
2. **Documented migrate/replatform** — database-centric migration when interim or target instances are needed
3. **aap-bridge** — API-centric migration ([redhat-cop/aap-bridge](https://github.com/redhat-cop/aap-bridge)) for piecemeal multi-tenant moves or when bridge fits interim stages
4. **Managed service ticket** — Red Hat support onboarding for Managed AAP on AWS/Azure
5. **Greenfield** — new deployment from IaC when the legacy platform has little value to migrate

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173/aap-upgrade-decisions/

## Build and test

```bash
npm run build
npm test
```

## Reference documentation

Bundled PDFs (also linked from the report):

- `public/docs/aap-plan-2-6-pdf.pdf`
- `public/docs/aap-upgrade-2-6-pdf.pdf`
- `public/docs/aap-migrate-2-6-pdf.pdf`
- `public/docs/aap-install-2-6-pdf.pdf`

## Tech stack

- React 19, TypeScript, PatternFly 6, Vite
- Static client-side decision engine (no backend required for GitHub Pages)

## License

GPL-3.0 — see [LICENSE](LICENSE).
