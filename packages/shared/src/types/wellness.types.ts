export interface WellnessLog {
  id: string;
  mood: number; // 1 to 5
  energyLevel: number; // 1 to 5
  stressLevel: number; // 1 to 5
  sleepHours: number;
  reflection: string;
  date: string; // YYYY-MM-DD
  loggedAt: string;
}

export interface PomodoroSettings {
  defaultDuration: number; // in minutes
  shortBreak: number;
  longBreak: number;
}

export interface DashboardPreferences {
  widgetOrder: string[];
  hiddenWidgets: string[];
  viewMode: 'COMPACT' | 'EXPANDED';
}
