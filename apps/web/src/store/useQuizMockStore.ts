import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Quiz, QuizResult, QuizHistoryEntry } from '@aelpt/shared';

interface QuizMockState {
  history: QuizHistoryEntry[];
  recentQuiz: Quiz | null;
  bestScores: Record<string, number>; // key: topicId or subjectId -> max score

  saveQuizAttempt: (quiz: Quiz, result: QuizResult) => void;
  clearQuizHistory: () => void;
  resetQuizStore: () => void;
}

export const useQuizMockStore = create<QuizMockState>()(
  persist(
    (set) => ({
      history: [],
      recentQuiz: null,
      bestScores: {},

      saveQuizAttempt: (quiz, result) => {
        set((state) => {
          const entry: QuizHistoryEntry = {
            id: `hist_${Date.now()}`,
            quiz,
            result,
            completedAt: new Date().toISOString(),
          };

          const key = quiz.topicId || quiz.subjectId || 'global';
          const currentBest = state.bestScores[key] || 0;
          const newBest = Math.max(currentBest, result.score);

          return {
            history: [entry, ...state.history],
            recentQuiz: quiz,
            bestScores: {
              ...state.bestScores,
              [key]: newBest,
            },
          };
        });
      },

      clearQuizHistory: () => {
        set({ history: [], recentQuiz: null, bestScores: {} });
      },

      resetQuizStore: () => {
        set({ history: [], recentQuiz: null, bestScores: {} });
      },
    }),
    {
      name: 'aelpt-quiz-mock',
    }
  )
);
