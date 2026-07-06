import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Resources' };

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        title="Resources"
        subtitle="Save and organise links, PDFs, and videos."
      />
      <ComingSoon
        featureName="Resource Manager"
        description="Attach resources to topics and subjects for quick reference."
        phase="Phase 6 — Notes & Resource Manager"
      />
    </>
  );
}
