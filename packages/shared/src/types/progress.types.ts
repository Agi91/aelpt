export interface UserProgressSummary {
  userId: string;
  overallCompletion: number;
  overallUnderstanding: number;
  totalStudyTimeMinutes: number;
  streakCount: number;
  lastActiveDate?: string;
  nextStreakGracePeriodEnd?: string;
}

export interface DailyStudyActivity {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  topicsCompleted: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type:
    | 'TOPIC_COMPLETED'
    | 'TOPIC_STARTED'
    | 'UNDERSTANDING_UPDATED'
    | 'STREAK_MILESTONE';
  message: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon identifier
  unlockedAt?: string;
  progress: number; // 0 to 100
  category: 'STREAK' | 'COMPLETION' | 'UNDERSTANDING' | 'SPECIAL';
}
