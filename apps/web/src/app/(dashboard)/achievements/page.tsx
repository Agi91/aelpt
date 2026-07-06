import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Achievements' };

export default function AchievementsPage() {
  return (
    <>
      <PageHeader
        title="Achievements"
        subtitle="Celebrate your learning milestones."
      />
      <ComingSoon
        featureName="Achievements & Gamification"
        description="Earn badges and trophies as you complete topics, build streaks, and master subjects."
        phase="Phase 9 — Analytics, Gamification & Dashboard"
      />
    </>
  );
}
