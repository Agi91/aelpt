import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Revision' };

export default function RevisionPage() {
  return (
    <>
      <PageHeader
        title="Revision"
        subtitle="Review your weak areas and due flashcards."
      />
      <ComingSoon
        featureName="Revision Mode"
        description="AI-powered revision sessions targeting your weakest topics."
        phase="Phase 5 — Spaced Repetition & Flashcards"
      />
    </>
  );
}
