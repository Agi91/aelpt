import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Adjust account preferences and system configuration."
      />
      <ComingSoon
        featureName="Account Settings"
        description="Configure notifications, themes, password changes, and account preferences."
        phase="Phase 12 — Polish, Testing & Deployment"
      />
    </>
  );
}
