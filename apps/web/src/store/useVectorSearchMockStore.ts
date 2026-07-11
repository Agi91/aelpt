import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchResult } from '@aelpt/shared';

interface VectorSearchMockState {
  history: string[]; // List of all past search queries
  recentSearches: string[]; // Fast-access recent searches
  cachedResults: Record<string, SearchResult[]>; // Cache mapping query -> results
  isLoading: boolean;

  addSearchToHistory: (query: string) => void;
  clearHistory: () => void;
  cacheResults: (query: string, results: SearchResult[]) => void;
  setLoading: (loading: boolean) => void;
  resetSearchStore: () => void;
}

export const useVectorSearchMockStore = create<VectorSearchMockState>()(
  persist(
    (set) => ({
      history: [],
      recentSearches: [],
      cachedResults: {},
      isLoading: false,

      addSearchToHistory: (query) => {
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) {
            return {};
          }

          const filteredHistory = state.history.filter((q) => q !== trimmed);
          const filteredRecent = state.recentSearches.filter(
            (q) => q !== trimmed
          );

          return {
            history: [trimmed, ...filteredHistory].slice(0, 50),
            recentSearches: [trimmed, ...filteredRecent].slice(0, 10),
          };
        });
      },

      clearHistory: () => {
        set({ history: [], recentSearches: [] });
      },

      cacheResults: (query, results) => {
        set((state) => ({
          cachedResults: {
            ...state.cachedResults,
            [query]: results,
          },
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      resetSearchStore: () => {
        set({
          history: [],
          recentSearches: [],
          cachedResults: {},
          isLoading: false,
        });
      },
    }),
    {
      name: 'aelpt-vector-search-mock',
    }
  )
);
