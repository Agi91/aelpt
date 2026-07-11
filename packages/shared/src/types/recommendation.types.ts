export type RecommendationCategory =
  | 'STUDY_TOPIC'
  | 'REVISE_UNIT'
  | 'PRACTICE_QUIZ'
  | 'REVIEW_FLASHCARDS'
  | 'READ_NOTE'
  | 'IMPROVE_WEAK_CONCEPT';

export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendationReason =
  | 'LOW_UNDERSTANDING'
  | 'QUIZ_FAILED'
  | 'INACTIVE_LONG'
  | 'DUE_REVISION'
  | 'DECK_DUE'
  | 'SEMANTIC_SIMILARITY';

export interface StudySuggestion {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  reason: RecommendationReason;
  score: number; // 0 to 100 representing priority score
  confidence: number; // 0.0 to 1.0 confidence factor
  generatedAt: string;
  relatedTopicId?: string;
  relatedSubjectId?: string;
  sourceReference?: string; // e.g. "Note: OSI Layer", "Quiz: Network Routing"
}

export interface DailyStudyPlan {
  id: string;
  dailyGoals: string[];
  estimatedMinutes: number;
  recommendedOrder: string[]; // List of suggestion IDs
  revisionReminders: string[];
  generatedAt: string;
}

export interface RecommendationPayload {
  suggestions: StudySuggestion[];
  dailyPlan: DailyStudyPlan;
  generatedAt: string;
}
