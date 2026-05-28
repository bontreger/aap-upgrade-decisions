import type { DocRef } from '../types/wizard';

const BASE = import.meta.env.BASE_URL;

export const DOC_LINKS = {
  plan: { label: 'Plan (2.6)', href: `${BASE}docs/aap-plan-2-6-pdf.pdf` },
  upgrade: { label: 'Upgrade (2.6)', href: `${BASE}docs/aap-upgrade-2-6-pdf.pdf` },
  migrate: { label: 'Migrate (2.6)', href: `${BASE}docs/aap-migrate-2-6-pdf.pdf` },
  install: { label: 'Install (2.6)', href: `${BASE}docs/aap-install-2-6-pdf.pdf` },
  blog: {
    label: 'Planning your upgrade path to AAP 2.6 (Red Hat Blog)',
    href: 'https://www.redhat.com/en/blog/planning-your-upgrade-path-ansible-automation-platform-26',
  },
  bridge: {
    label: 'aap-bridge (redhat-cop)',
    href: 'https://github.com/redhat-cop/aap-bridge',
  },
  bridgeCaveats: {
    label: 'AAP Bridge migration caveats',
    href: 'https://gist.github.com/rooftopcellist/e0f253a16433f94893191fd1fea8b680',
  },
} as const;

export function refs(...keys: (keyof typeof DOC_LINKS)[]): DocRef[] {
  return keys.map((k) => DOC_LINKS[k]);
}
