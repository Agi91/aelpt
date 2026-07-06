import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Track your learning progress over time."
      />
      <ComingSoon
        featureName="Analytics & Learning Insights"
        description="Visualise your understanding scores, study streaks, and topic mastery progression."
        phase="Phase 9 — Analytics, Gamification & Dashboard"
      />
    </>
  );
}
