import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Badge,
  GamificationAchievement,
  DailyChallenge,
  WeeklyChallenge,
  XPHistoryEntry,
  GamificationEngine,
} from '@aelpt/shared';
import { toast } from 'sonner';

interface GamificationMockState {
  xp: number;
  level: number;
  title: string;
  progressPercent: number;
  achievements: GamificationAchievement[];
  badges: Badge[];
  dailyChallenges: DailyChallenge[];
  weeklyChallenges: WeeklyChallenge[];
  xpHistory: XPHistoryEntry[];
  rewardsClaimed: string[];

  addXp: (amount: number, reason: string) => void;
  incrementDailyChallenge: (
    type: DailyChallenge['type'],
    amount: number
  ) => void;
  incrementWeeklyChallenge: (
    type: WeeklyChallenge['type'],
    amount: number
  ) => void;
  checkAchievements: (stats: {
    streakCount: number;
    completedTopicsCount: number;
    completedQuizzesCount: number;
    reviewedFlashcardsCount: number;
    createdNotesCount: number;
  }) => void;
  claimReward: (rewardId: string, xpAmount: number) => void;
  resetGamificationStore: () => void;
}

const DEFAULT_ACHIEVEMENTS: GamificationAchievement[] = [
  {
    id: 'first_login',
    title: 'First Login',
    description: 'Log in to the system for the first time.',
    icon: 'Zap',
    progress: 100,
    xpReward: 50,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'first_topic',
    title: 'First Topic',
    description: 'Complete your first study topic.',
    icon: 'BookOpen',
    progress: 0,
    xpReward: 100,
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Complete 5 interactive quizzes.',
    icon: 'Award',
    progress: 0,
    xpReward: 250,
  },
  {
    id: 'flashcard_expert',
    title: 'Flashcard Expert',
    description: 'Review 50 due flashcards.',
    icon: 'Layers',
    progress: 0,
    xpReward: 200,
  },
  {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Achieve a 5-day study streak.',
    icon: 'Flame',
    progress: 0,
    xpReward: 300,
  },
  {
    id: 'xp_100',
    title: 'XP Scholar',
    description: 'Accumulate 100 XP total.',
    icon: 'Brain',
    progress: 0,
    xpReward: 50,
  },
  {
    id: 'xp_1000',
    title: 'XP Master',
    description: 'Accumulate 1000 XP total.',
    icon: 'Trophy',
    progress: 0,
    xpReward: 200,
  },
];

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'badge_newbie',
    name: 'Newbie Explorer',
    description: 'Awarded for joining AELPT.',
    icon: 'Zap',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'badge_scholar',
    name: 'High Scholar',
    description: 'Awarded for reaching Level 3.',
    icon: 'Award',
  },
  {
    id: 'badge_expert',
    name: 'Subject Expert',
    description: 'Awarded for reaching Level 5.',
    icon: 'Trophy',
  },
  {
    id: 'badge_timer',
    name: 'Focus Master',
    description: 'Awarded for studying 2+ hours.',
    icon: 'Clock',
  },
];

const DEFAULT_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily_focus',
    title: 'Study focus',
    description: 'Study 30 minutes today.',
    targetCount: 30,
    currentCount: 0,
    xpReward: 50,
    isCompleted: false,
    type: 'STUDY_TIME',
  },
  {
    id: 'daily_topics',
    title: 'Complete topics',
    description: 'Finish 2 syllabus topics.',
    targetCount: 2,
    currentCount: 0,
    xpReward: 75,
    isCompleted: false,
    type: 'TOPICS',
  },
  {
    id: 'daily_flashcards',
    title: 'Review cards',
    description: 'Review 20 flashcards.',
    targetCount: 20,
    currentCount: 0,
    xpReward: 60,
    isCompleted: false,
    type: 'FLASHCARDS',
  },
  {
    id: 'daily_quiz',
    title: 'Finish quiz',
    description: 'Resolve 1 interactive quiz.',
    targetCount: 1,
    currentCount: 0,
    xpReward: 80,
    isCompleted: false,
    type: 'QUIZ',
  },
];

const DEFAULT_WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'weekly_subject',
    title: 'Subject completion',
    description: 'Unlock 1 course subject fully.',
    targetCount: 1,
    currentCount: 0,
    xpReward: 300,
    isCompleted: false,
    type: 'SUBJECT',
  },
  {
    id: 'weekly_quizzes',
    title: 'Quiz run',
    description: 'Complete 5 interactive quizzes.',
    targetCount: 5,
    currentCount: 0,
    xpReward: 250,
    isCompleted: false,
    type: 'QUIZ_COUNT',
  },
  {
    id: 'weekly_flashcards',
    title: 'Review load',
    description: 'Review 100 flashcards.',
    targetCount: 100,
    currentCount: 0,
    xpReward: 200,
    isCompleted: false,
    type: 'FLASHCARD_COUNT',
  },
  {
    id: 'weekly_streak',
    title: 'Streak shield',
    description: 'Maintain a 5-day active streak.',
    targetCount: 5,
    currentCount: 0,
    xpReward: 150,
    isCompleted: false,
    type: 'STREAK',
  },
];

export const useGamificationMockStore = create<GamificationMockState>()(
  persist(
    (set, get) => ({
      xp: 150, // Preloaded default XP
      level: 1,
      title: 'Beginner',
      progressPercent: 15,
      achievements: DEFAULT_ACHIEVEMENTS,
      badges: DEFAULT_BADGES,
      dailyChallenges: DEFAULT_DAILY_CHALLENGES,
      weeklyChallenges: DEFAULT_WEEKLY_CHALLENGES,
      xpHistory: [
        {
          id: 'init_login',
          amount: 100,
          reason: 'Initial Registration Bonus',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'login_day1',
          amount: 50,
          reason: 'First Login',
          timestamp: new Date().toISOString(),
        },
      ],
      rewardsClaimed: [],

      addXp: (amount, reason) => {
        set((state) => {
          const newXp = state.xp + amount;
          const details = GamificationEngine.getLevelDetails(newXp);
          const historyEntry: XPHistoryEntry = {
            id: `xp_log_${Date.now()}`,
            amount,
            reason,
            timestamp: new Date().toISOString(),
          };

          if (details.level > state.level) {
            toast.success(
              `🎉 Level Up! You reached Level ${details.level}: ${details.title}!`
            );

            // Auto unlock badges if level thresholds hit
            state.badges = state.badges.map((b) => {
              if (
                b.id === 'badge_scholar' &&
                details.level >= 3 &&
                !b.unlockedAt
              ) {
                return { ...b, unlockedAt: new Date().toISOString() };
              }
              if (
                b.id === 'badge_expert' &&
                details.level >= 5 &&
                !b.unlockedAt
              ) {
                return { ...b, unlockedAt: new Date().toISOString() };
              }
              return b;
            });
          }

          return {
            xp: newXp,
            level: details.level,
            title: details.title,
            progressPercent: details.progressPercent,
            xpHistory: [historyEntry, ...state.xpHistory].slice(0, 50),
            badges: state.badges,
          };
        });
      },

      incrementDailyChallenge: (type, amount) => {
        set((state) => {
          const updated = state.dailyChallenges.map((c) => {
            if (c.type === type && !c.isCompleted) {
              const currentCount = Math.min(
                c.targetCount,
                c.currentCount + amount
              );
              const isCompleted = currentCount >= c.targetCount;
              if (isCompleted) {
                // Defer adding XP
                setTimeout(
                  () =>
                    get().addXp(
                      c.xpReward,
                      `Completed Daily Challenge: ${c.title}`
                    ),
                  100
                );
              }
              return { ...c, currentCount, isCompleted };
            }
            return c;
          });
          return { dailyChallenges: updated };
        });
      },

      incrementWeeklyChallenge: (type, amount) => {
        set((state) => {
          const updated = state.weeklyChallenges.map((c) => {
            if (c.type === type && !c.isCompleted) {
              const currentCount = Math.min(
                c.targetCount,
                c.currentCount + amount
              );
              const isCompleted = currentCount >= c.targetCount;
              if (isCompleted) {
                // Defer adding XP
                setTimeout(
                  () =>
                    get().addXp(
                      c.xpReward,
                      `Completed Weekly Challenge: ${c.title}`
                    ),
                  100
                );
              }
              return { ...c, currentCount, isCompleted };
            }
            return c;
          });
          return { weeklyChallenges: updated };
        });
      },

      checkAchievements: (stats) => {
        const current = get().achievements;
        const totalXp = get().xp;
        const { updatedAchievements, newlyUnlockedIds } =
          GamificationEngine.evaluateAchievements(current, {
            ...stats,
            totalXp,
          });

        if (newlyUnlockedIds.length > 0) {
          set({ achievements: updatedAchievements });
          newlyUnlockedIds.forEach((id) => {
            const ach = updatedAchievements.find((a) => a.id === id);
            if (ach) {
              toast.success(`🏆 Achievement Unlocked: ${ach.title}!`);
              get().addXp(ach.xpReward, `Unlocked Achievement: ${ach.title}`);
            }
          });
        }
      },

      claimReward: (rewardId, xpAmount) => {
        set((state) => {
          if (state.rewardsClaimed.includes(rewardId)) return {};
          setTimeout(
            () => get().addXp(xpAmount, `Claimed Reward: ${rewardId}`),
            100
          );
          return {
            rewardsClaimed: [...state.rewardsClaimed, rewardId],
          };
        });
      },

      resetGamificationStore: () => {
        set({
          xp: 0,
          level: 1,
          title: 'Beginner',
          progressPercent: 0,
          achievements: DEFAULT_ACHIEVEMENTS.map((a) => {
            const rest = { ...a };
            delete rest.unlockedAt;
            return { ...rest, progress: 0 };
          }),
          badges: DEFAULT_BADGES.map((b) => {
            const rest = { ...b };
            delete rest.unlockedAt;
            return rest;
          }),
          dailyChallenges: DEFAULT_DAILY_CHALLENGES.map((c) => ({
            ...c,
            currentCount: 0,
            isCompleted: false,
          })),
          weeklyChallenges: DEFAULT_WEEKLY_CHALLENGES.map((c) => ({
            ...c,
            currentCount: 0,
            isCompleted: false,
          })),
          xpHistory: [],
          rewardsClaimed: [],
        });
      },
    }),
    {
      name: 'aelpt-gamification-mock',
    }
  )
);
