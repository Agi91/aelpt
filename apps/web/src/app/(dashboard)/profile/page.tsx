import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Manage your profile details and learning preferences."
      />
      <ComingSoon
        featureName="Profile Management"
        description="View your user stats, edit your profile details, and adjust academic targets."
        phase="Phase 1 — Complete (Sync Active)"
      />
    </>
  );
}
