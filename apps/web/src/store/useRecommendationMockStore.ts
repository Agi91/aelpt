import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  StudySuggestion,
  DailyStudyPlan,
  RecommendationPayload,
} from '@aelpt/shared';

interface RecommendationMockState {
  suggestions: StudySuggestion[];
  dailyPlan: DailyStudyPlan | null;
  dismissedIds: string[];
  completedIds: string[];
  history: RecommendationPayload[];
  isRefreshing: boolean;

  setRecommendations: (payload: RecommendationPayload) => void;
  dismissRecommendation: (id: string) => void;
  completeRecommendation: (id: string) => void;
  setRefreshing: (refreshing: boolean) => void;
  clearStore: () => void;
}

export const useRecommendationMockStore = create<RecommendationMockState>()(
  persist(
    (set) => ({
      suggestions: [],
      dailyPlan: null,
      dismissedIds: [],
      completedIds: [],
      history: [],
      isRefreshing: false,

      setRecommendations: (payload) => {
        set((state) => ({
          suggestions: payload.suggestions,
          dailyPlan: payload.dailyPlan,
          history: [payload, ...state.history].slice(0, 10),
        }));
      },

      dismissRecommendation: (id) => {
        set((state) => ({
          dismissedIds: [...state.dismissedIds, id],
        }));
      },

      completeRecommendation: (id) => {
        set((state) => ({
          completedIds: [...state.completedIds, id],
        }));
      },

      setRefreshing: (refreshing) => {
        set({ isRefreshing: refreshing });
      },

      clearStore: () => {
        set({
          suggestions: [],
          dailyPlan: null,
          dismissedIds: [],
          completedIds: [],
          history: [],
          isRefreshing: false,
        });
      },
    }),
    {
      name: 'aelpt-recommendations-mock',
    }
  )
);
