export interface KPIStats {
  totalStudyHours: number;
  topicsCompleted: number;
  quizzesCompleted: number;
  flashcardsReviewed: number;
  notesCreated: number;
  currentStreak: number;
  xpEarned: number;
  currentLevel: number;
}

export interface LearningInsight {
  type:
    | 'strongest_subject'
    | 'weakest_subject'
    | 'most_active_day'
    | 'least_studied'
    | 'best_quiz'
    | 'productivity_trend';
  title: string;
  value: string;
  description: string;
}

export interface WeeklyStudyChartData {
  dayName: string; // e.g. "Mon"
  hours: number;
}

export interface MonthlyProgressChartData {
  monthName: string; // e.g. "Jun"
  completionRate: number;
}

export interface SubjectChartData {
  subjectCode: string;
  coverage: number;
  mastery: number;
}

export interface QuizAccuracyChartData {
  name: string; // "Correct", "Incorrect", "Skipped"
  value: number;
}

export interface UnderstandingTrendChartData {
  date: string;
  avgScore: number;
}

export interface FlashcardChartData {
  deckName: string;
  dueCount: number;
  reviewedCount: number;
}

export interface XPGrowthChartData {
  date: string;
  cumulativeXp: number;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // minutes studied
}

export interface ActivityTimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'QUIZ' | 'TOPIC' | 'FLASHCARD' | 'NOTE' | 'SYSTEM';
}

export interface AnalyticsPayload {
  kpis: KPIStats;
  insights: LearningInsight[];
  weeklyStudy: WeeklyStudyChartData[];
  monthlyProgress: MonthlyProgressChartData[];
  subjectsData: SubjectChartData[];
  quizAccuracy: QuizAccuracyChartData[];
  understandingTrend: UnderstandingTrendChartData[];
  flashcardData: FlashcardChartData[];
  xpGrowth: XPGrowthChartData[];
  heatmap: HeatmapDay[];
  timeline: ActivityTimelineItem[];
}
