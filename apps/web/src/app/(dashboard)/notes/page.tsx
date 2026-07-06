import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Notes' };

export default function NotesPage() {
  return (
    <>
      <PageHeader
        title="Notes"
        subtitle="Capture and review your study notes."
      />
      <ComingSoon
        featureName="Notes & Resource Manager"
        description="Write, tag, and search notes linked to your topics and subjects."
        phase="Phase 6 — Notes & Resource Manager"
      />
    </>
  );
}
