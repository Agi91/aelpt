import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Achievement, ActivityLog, DailyStudyActivity } from '@aelpt/shared';

interface ProgressMockState {
  streakCount: number;
  lastActiveDate: string;
  dailyActivities: DailyStudyActivity[];
  activityLogs: ActivityLog[];
  achievements: Achievement[];

  // Actions
  addStudyMinutes: (minutes: number) => void;
  logTopicCompleted: (topicTitle: string) => void;
  logTopicStarted: (topicTitle: string) => void;
  logUnderstandingUpdated: (topicTitle: string, score: number) => void;
  incrementAchievementProgress: (id: string, amount: number) => void;
  checkStreak: () => void;
  resetProgressStore: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_subject',
    title: 'First Step',
    description: 'Add your first semester course subject to begin mapping.',
    icon: 'BookOpen',
    progress: 100,
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'SPECIAL',
  },
  {
    id: 'topic_crusher',
    title: 'Topic Crusher',
    description: 'Mark 5 study topics as fully completed.',
    icon: 'Award',
    progress: 40, // 2 out of 5
    category: 'COMPLETION',
  },
  {
    id: 'deep_learner',
    title: 'Deep Learner',
    description: 'Achieve 90%+ understanding score on any topic.',
    icon: 'Brain',
    progress: 100,
    unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'UNDERSTANDING',
  },
  {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Maintain a 5-day consecutive active study streak.',
    icon: 'Zap',
    progress: 60, // 3 days
    category: 'STREAK',
  },
];

const DEFAULT_ACTIVITIES: DailyStudyActivity[] = [
  {
    id: 'act_1',
    userId: 'mock-user',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    minutesStudied: 45,
    topicsCompleted: 1,
  },
  {
    id: 'act_2',
    userId: 'mock-user',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    minutesStudied: 30,
    topicsCompleted: 0,
  },
  {
    id: 'act_3',
    userId: 'mock-user',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    minutesStudied: 60,
    topicsCompleted: 2,
  },
  {
    id: 'act_4',
    userId: 'mock-user',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    minutesStudied: 0,
    topicsCompleted: 0,
  },
  {
    id: 'act_5',
    userId: 'mock-user',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    minutesStudied: 90,
    topicsCompleted: 1,
  },
  {
    id: 'act_6',
    userId: 'mock-user',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    minutesStudied: 120,
    topicsCompleted: 3,
  },
  {
    id: 'act_7',
    userId: 'mock-user',
    date: new Date().toISOString().slice(0, 10),
    minutesStudied: 45,
    topicsCompleted: 1,
  },
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    userId: 'mock-user',
    type: 'TOPIC_STARTED',
    message: 'Started studying "Quick Sort Partitioning"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log_2',
    userId: 'mock-user',
    type: 'TOPIC_COMPLETED',
    message: 'Marked "Dynamic Programming Intro" as Completed',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log_3',
    userId: 'mock-user',
    type: 'UNDERSTANDING_UPDATED',
    message:
      'Increased self-understanding of "Relational Algebra Schema" to 95%',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log_4',
    userId: 'mock-user',
    type: 'STREAK_MILESTONE',
    message: 'Achieved a study streak milestone of 3 consecutive active days!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useProgressMockStore = create<ProgressMockState>()(
  persist(
    (set) => ({
      streakCount: 3,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      dailyActivities: DEFAULT_ACTIVITIES,
      activityLogs: DEFAULT_LOGS,
      achievements: DEFAULT_ACHIEVEMENTS,

      addStudyMinutes: (minutes) => {
        set((state) => {
          const todayStr = new Date().toISOString().slice(0, 10);
          const hasTodayActivity = state.dailyActivities.find(
            (act) => act.date === todayStr
          );

          let nextActivities;
          if (hasTodayActivity) {
            nextActivities = state.dailyActivities.map((act) =>
              act.date === todayStr
                ? { ...act, minutesStudied: act.minutesStudied + minutes }
                : act
            );
          } else {
            nextActivities = [
              ...state.dailyActivities,
              {
                id: `act_${Date.now()}`,
                userId: 'mock-user',
                date: todayStr,
                minutesStudied: minutes,
                topicsCompleted: 0,
              },
            ];
          }

          const newLog: ActivityLog = {
            id: `log_${Date.now()}`,
            userId: 'mock-user',
            type: 'TOPIC_STARTED',
            message: `Studied academic course materials for ${minutes} minutes`,
            timestamp: new Date().toISOString(),
          };

          return {
            dailyActivities: nextActivities,
            activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
          };
        });
      },

      logTopicCompleted: (topicTitle) => {
        set((state) => {
          const todayStr = new Date().toISOString().slice(0, 10);
          const hasTodayActivity = state.dailyActivities.find(
            (act) => act.date === todayStr
          );

          let nextActivities;
          if (hasTodayActivity) {
            nextActivities = state.dailyActivities.map((act) =>
              act.date === todayStr
                ? { ...act, topicsCompleted: act.topicsCompleted + 1 }
                : act
            );
          } else {
            nextActivities = [
              ...state.dailyActivities,
              {
                id: `act_${Date.now()}`,
                userId: 'mock-user',
                date: todayStr,
                minutesStudied: 0,
                topicsCompleted: 1,
              },
            ];
          }

          const newLog: ActivityLog = {
            id: `log_${Date.now()}`,
            userId: 'mock-user',
            type: 'TOPIC_COMPLETED',
            message: `Completed learning topic: "${topicTitle}"`,
            timestamp: new Date().toISOString(),
          };

          return {
            dailyActivities: nextActivities,
            activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
          };
        });
      },

      logTopicStarted: (topicTitle) => {
        set((state) => {
          const newLog: ActivityLog = {
            id: `log_${Date.now()}`,
            userId: 'mock-user',
            type: 'TOPIC_STARTED',
            message: `Started learning session: "${topicTitle}"`,
            timestamp: new Date().toISOString(),
          };
          return {
            activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
          };
        });
      },

      logUnderstandingUpdated: (topicTitle, score) => {
        set((state) => {
          const newLog: ActivityLog = {
            id: `log_${Date.now()}`,
            userId: 'mock-user',
            type: 'UNDERSTANDING_UPDATED',
            message: `Updated understanding score of "${topicTitle}" to ${score}%`,
            timestamp: new Date().toISOString(),
          };

          // Auto unlock Deep Learner if score >= 90
          const nextAchievements = state.achievements.map(
            (ach): Achievement => {
              if (ach.id === 'deep_learner' && score >= 90 && !ach.unlockedAt) {
                return {
                  ...ach,
                  progress: 100,
                  unlockedAt: new Date().toISOString(),
                };
              }
              return ach;
            }
          );

          return {
            activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
            achievements: nextAchievements,
          };
        });
      },

      incrementAchievementProgress: (id, amount) => {
        set((state) => {
          const nextAchievements = state.achievements.map(
            (ach): Achievement => {
              if (ach.id === id) {
                const nextProgress = Math.min(ach.progress + amount, 100);
                const unlockedAt =
                  nextProgress >= 100 && !ach.unlockedAt
                    ? new Date().toISOString()
                    : ach.unlockedAt;
                if (unlockedAt) {
                  return { ...ach, progress: nextProgress, unlockedAt };
                }
                const rest = { ...ach };
                delete rest.unlockedAt;
                return { ...rest, progress: nextProgress };
              }
              return ach;
            }
          );
          return { achievements: nextAchievements };
        });
      },

      checkStreak: () => {
        set((state) => {
          const todayStr = new Date().toISOString().slice(0, 10);
          const lastActiveStr = state.lastActiveDate;

          if (todayStr === lastActiveStr) {
            return state; // No change, already active today
          }

          const todayDate = new Date(todayStr);
          const lastActiveDateObj = new Date(lastActiveStr);
          const diffTime = Math.abs(
            todayDate.getTime() - lastActiveDateObj.getTime()
          );
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let nextStreak = state.streakCount;
          if (diffDays === 1) {
            nextStreak += 1;
          } else if (diffDays > 1) {
            nextStreak = 1; // Streak reset
          }

          return {
            ...state,
            streakCount: nextStreak,
            lastActiveDate: todayStr,
          };
        });
      },

      resetProgressStore: () => {
        set({
          streakCount: 0,
          lastActiveDate: new Date().toISOString().slice(0, 10),
          dailyActivities: [],
          activityLogs: [],
          achievements: DEFAULT_ACHIEVEMENTS.map((ach) => {
            const rest = { ...ach };
            delete rest.unlockedAt;
            return {
              ...rest,
              progress:
                ach.id === 'first_subject' || ach.id === 'deep_learner'
                  ? 0
                  : ach.progress,
            };
          }),
        });
      },
    }),
    {
      name: 'aelpt-progress-mock',
    }
  )
);
