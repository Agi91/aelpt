import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Study Planner' };

export default function PlannerPage() {
  return (
    <>
      <PageHeader
        title="Study Planner"
        subtitle="Plan and schedule your study sessions."
      />
      <ComingSoon
        featureName="Study Planner & Calendar"
        description="Schedule dedicated study sessions, set reminders, and manage your time effectively."
        phase="Phase 10 — Study Planner & Calendar (Future)"
      />
    </>
  );
}
