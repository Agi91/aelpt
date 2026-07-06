import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Semesters' };

export default function SemestersPage() {
  return (
    <>
      <PageHeader
        title="Semesters"
        subtitle="Organise your learning by semester, subject, unit, and topic."
      />
      <ComingSoon
        featureName="Academic Structure"
        description="Add semesters and subjects to start tracking your learning progress."
        phase="Phase 3 — Academic Structure"
      />
    </>
  );
}
