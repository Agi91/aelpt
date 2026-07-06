import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Wellness' };

export default function WellnessPage() {
  return (
    <>
      <PageHeader
        title="Wellness"
        subtitle="Monitor your burnout score and mental balance."
      />
      <ComingSoon
        featureName="Wellness & Burnout Monitor"
        description="Track stress levels, study load, and get AI-powered recommendations for healthy study habits."
        phase="Phase 11 — Recommendation Engine & Wellness (Future)"
      />
    </>
  );
}
