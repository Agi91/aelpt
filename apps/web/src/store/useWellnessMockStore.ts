import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WellnessLog,
  PomodoroSettings,
  DashboardPreferences,
} from '@aelpt/shared';
import { toast } from 'sonner';

interface WellnessMockState {
  // Timer State
  minutes: number;
  seconds: number;
  isRunning: boolean;
  timerMode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  completedSessions: number;
  timerSettings: PomodoroSettings;

  // Wellness Logs
  wellnessLogs: WellnessLog[];

  // Preferences
  preferences: DashboardPreferences;

  // Actions - Timer
  tick: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK') => void;
  updateTimerSettings: (settings: Partial<PomodoroSettings>) => void;

  // Actions - Wellness
  addWellnessLog: (log: Omit<WellnessLog, 'id' | 'loggedAt'>) => void;

  // Actions - Preferences
  reorderWidgets: (widgetOrder: string[]) => void;
  toggleWidgetVisibility: (id: string) => void;
  setViewMode: (mode: 'COMPACT' | 'EXPANDED') => void;
  resetWellnessStore: () => void;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  widgetOrder: [
    'AI_STUDY_GUIDE',
    'PLANNER_SNAPSHOT',
    'GAMIFICATION_SUMMARY',
    'PRODUCTIVITY_TIMER',
    'WELLNESS_STATUS',
  ],
  hiddenWidgets: [],
  viewMode: 'EXPANDED',
};

const DEFAULT_WELLNESS_LOGS: WellnessLog[] = [
  {
    id: 'well_1',
    mood: 4,
    energyLevel: 4,
    stressLevel: 2,
    sleepHours: 7.5,
    reflection: 'Had a highly productive focus session on TCP models.',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]!,
    loggedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'well_2',
    mood: 3,
    energyLevel: 3,
    stressLevel: 4,
    sleepHours: 6.0,
    reflection: 'A bit tired today but completed the RAG quiz milestone.',
    date: new Date().toISOString().split('T')[0]!,
    loggedAt: new Date().toISOString(),
  },
];

export const useWellnessMockStore = create<WellnessMockState>()(
  persist(
    (set, get) => ({
      // Timer initial state
      minutes: 25,
      seconds: 0,
      isRunning: false,
      timerMode: 'WORK',
      completedSessions: 0,
      timerSettings: {
        defaultDuration: 25,
        shortBreak: 5,
        longBreak: 15,
      },

      wellnessLogs: DEFAULT_WELLNESS_LOGS,
      preferences: DEFAULT_PREFERENCES,

      tick: () => {
        const {
          minutes,
          seconds,
          timerMode,
          timerSettings,
          completedSessions,
        } = get();
        if (seconds > 0) {
          set({ seconds: seconds - 1 });
        } else if (minutes > 0) {
          set({ minutes: minutes - 1, seconds: 59 });
        } else {
          // Timer finished
          get().pauseTimer();
          if (timerMode === 'WORK') {
            const nextSessions = completedSessions + 1;
            const nextMode =
              nextSessions % 4 === 0
                ? ('LONG_BREAK' as const)
                : ('SHORT_BREAK' as const);
            toast.success(`💪 Focus session completed! Time for a break!`);
            set({
              completedSessions: nextSessions,
              timerMode: nextMode,
              minutes:
                nextMode === 'LONG_BREAK'
                  ? timerSettings.longBreak
                  : timerSettings.shortBreak,
              seconds: 0,
            });
          } else {
            toast.success(`⏰ Break finished! Ready to work?`);
            set({
              timerMode: 'WORK',
              minutes: timerSettings.defaultDuration,
              seconds: 0,
            });
          }
        }
      },

      startTimer: () => {
        set({ isRunning: true });
      },

      pauseTimer: () => {
        set({ isRunning: false });
      },

      stopTimer: () => {
        const { timerSettings } = get();
        set({
          isRunning: false,
          minutes: timerSettings.defaultDuration,
          seconds: 0,
          timerMode: 'WORK',
        });
      },

      resetTimer: () => {
        const { timerMode, timerSettings } = get();
        set({
          isRunning: false,
          seconds: 0,
          minutes:
            timerMode === 'WORK'
              ? timerSettings.defaultDuration
              : timerMode === 'SHORT_BREAK'
                ? timerSettings.shortBreak
                : timerSettings.longBreak,
        });
      },

      setTimerMode: (mode) => {
        const { timerSettings } = get();
        set({
          isRunning: false,
          timerMode: mode,
          seconds: 0,
          minutes:
            mode === 'WORK'
              ? timerSettings.defaultDuration
              : mode === 'SHORT_BREAK'
                ? timerSettings.shortBreak
                : timerSettings.longBreak,
        });
      },

      updateTimerSettings: (settings) => {
        set((state) => {
          const newSettings = { ...state.timerSettings, ...settings };
          return {
            timerSettings: newSettings,
            minutes:
              state.timerMode === 'WORK'
                ? newSettings.defaultDuration
                : state.timerMode === 'SHORT_BREAK'
                  ? newSettings.shortBreak
                  : newSettings.longBreak,
            seconds: 0,
          };
        });
        toast.success('Timer durations updated.');
      },

      addWellnessLog: (log) => {
        const newLog: WellnessLog = {
          ...log,
          id: `well_${Date.now()}`,
          loggedAt: new Date().toISOString(),
        };
        set((state) => ({
          wellnessLogs: [newLog, ...state.wellnessLogs].slice(0, 30),
        }));
        toast.success('Daily wellness metrics saved. Take breaks when tired!');
      },

      reorderWidgets: (widgetOrder) => {
        set((state) => ({
          preferences: { ...state.preferences, widgetOrder },
        }));
      },

      toggleWidgetVisibility: (id) => {
        set((state) => {
          const hidden = state.preferences.hiddenWidgets;
          const isHidden = hidden.includes(id);
          const newHidden = isHidden
            ? hidden.filter((x) => x !== id)
            : [...hidden, id];
          return {
            preferences: { ...state.preferences, hiddenWidgets: newHidden },
          };
        });
        toast.success('Dashboard layout updated.');
      },

      setViewMode: (mode) => {
        set((state) => ({
          preferences: { ...state.preferences, viewMode: mode },
        }));
      },

      resetWellnessStore: () => {
        const { timerSettings } = get();
        set({
          minutes: timerSettings.defaultDuration,
          seconds: 0,
          isRunning: false,
          timerMode: 'WORK',
          completedSessions: 0,
          wellnessLogs: DEFAULT_WELLNESS_LOGS,
          preferences: DEFAULT_PREFERENCES,
        });
      },
    }),
    {
      name: 'aelpt-wellness-mock',
    }
  )
);
