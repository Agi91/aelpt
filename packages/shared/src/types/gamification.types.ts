export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface GamificationAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number; // 0 to 100
  xpReward: number;
  unlockedAt?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  type: 'STUDY_TIME' | 'TOPICS' | 'FLASHCARDS' | 'QUIZ' | 'NOTES';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  type: 'SUBJECT' | 'QUIZ_COUNT' | 'FLASHCARD_COUNT' | 'STREAK';
}

export interface XPHistoryEntry {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  achievementCount: number;
  studyTimeMinutes: number;
  avatarInitials: string;
  isCurrentUser?: boolean;
}
