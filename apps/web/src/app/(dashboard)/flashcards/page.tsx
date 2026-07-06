import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Flashcards' };

export default function FlashcardsPage() {
  return (
    <>
      <PageHeader
        title="Flashcards"
        subtitle="Review topics with spaced repetition."
      />
      <ComingSoon
        featureName="Spaced Repetition & Flashcards"
        description="Study smarter with AI-generated flashcards and spaced repetition scheduling."
        phase="Phase 5 — Spaced Repetition & Flashcards"
      />
    </>
  );
}
