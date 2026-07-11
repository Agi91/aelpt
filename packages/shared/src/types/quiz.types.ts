import { Difficulty } from '../constants/difficulty';

export type QuestionType = 'MCQ' | 'TF' | 'FILL' | 'SHORT';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation: string;
  sourceReference: string; // e.g. "Note: TCP/IP Model"
  scoreWeight: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: Difficulty;
  timeLimit?: number; // in seconds, undefined means no limit
  subjectId?: string;
  topicId?: string;
  createdAt: string;
}

export interface QuizAttempt {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  quizId: string;
  score: number; // 0 to 100
  accuracy: number; // 0.0 to 1.0
  timeTaken: number; // in seconds
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  attempts: QuizAttempt[];
  summary: string;
  topicAnalysis: Array<{
    topicId?: string;
    topicTitle: string;
    accuracy: number;
  }>;
  completedAt: string;
}

export interface QuizHistoryEntry {
  id: string;
  quiz: Quiz;
  result: QuizResult;
  completedAt: string;
}
