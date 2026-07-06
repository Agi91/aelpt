import { PageHeader } from '@/components/common/PageHeader';
import { ComingSoon } from '@/components/common/ComingSoon';

export const metadata = { title: 'AI Mentor' };

export default function AiMentorPage() {
  return (
    <>
      <PageHeader
        title="AI Mentor"
        subtitle="Your personalised AI study companion."
      />
      <ComingSoon
        featureName="AI Mentor — Gemini Core"
        description="Ask questions, get explanations, and receive personalised study guidance powered by Gemini."
        phase="Phase 7 — AI Integration"
      />
    </>
  );
}
