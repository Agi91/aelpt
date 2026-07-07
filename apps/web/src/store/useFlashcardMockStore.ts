import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Flashcard,
  FlashcardDeck,
  CreateDeckInput,
  CreateFlashcardInput,
  ReviewHistoryEntry,
} from '@aelpt/shared';

interface FlashcardMockState {
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  reviewHistory: ReviewHistoryEntry[];

  // Deck Actions
  addDeck: (deck: CreateDeckInput) => string;
  updateDeck: (id: string, deck: Partial<CreateDeckInput>) => void;
  deleteDeck: (id: string) => void;

  // Flashcard Actions
  addFlashcard: (card: CreateFlashcardInput) => string;
  updateFlashcard: (id: string, card: Partial<CreateFlashcardInput>) => void;
  deleteFlashcard: (id: string) => void;

  // Study/Recall Reviews (SM-2 Spaced Repetition)
  reviewFlashcard: (
    id: string,
    rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
  ) => void;
  resetFlashcardStore: () => void;
}

const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: 'deck_1',
    userId: 'mock-user',
    name: 'Algorithms & Data Structures',
    description:
      'Core DSA concepts including sorting, graphs, and dynamic programming.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'deck_2',
    userId: 'mock-user',
    name: 'Database Management Systems',
    description: 'DBMS fundamentals, SQL queries, indexes, and normal forms.',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_1',
    deckId: 'deck_1',
    userId: 'mock-user',
    front:
      'What is the worst-case time complexity of Quick Sort, and when does it occur?',
    back: 'O(n^2), occurring when the pivot consistently splits the array into unbalanced partitions of sizes 0 and n-1 (e.g. when elements are already sorted and we pick the first/last element as pivot).',
    difficulty: 'MEDIUM',
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reps: 0,
    easeFactor: 2.5,
    interval: 0,
  },
  {
    id: 'fc_2',
    deckId: 'deck_1',
    userId: 'mock-user',
    front:
      'How does the Floyd-Warshall algorithm work, and what is its time complexity?',
    back: 'Floyd-Warshall is a dynamic programming algorithm that finds all-pairs shortest paths in a weighted graph. Its time complexity is O(V^3).',
    difficulty: 'HARD',
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reps: 0,
    easeFactor: 2.5,
    interval: 0,
  },
  {
    id: 'fc_3',
    deckId: 'deck_2',
    userId: 'mock-user',
    front: 'What is 3NF (Third Normal Form)?',
    back: 'A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key (i.e. all non-key attributes are dependent ONLY on the primary key).',
    difficulty: 'EASY',
    box: 2,
    nextReviewDate: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reps: 1,
    easeFactor: 2.6,
    interval: 2,
  },
];

export const useFlashcardMockStore = create<FlashcardMockState>()(
  persist(
    (set) => ({
      decks: DEFAULT_DECKS,
      flashcards: DEFAULT_FLASHCARDS,
      reviewHistory: [],

      addDeck: (deck) => {
        const id = `deck_${Date.now()}`;
        set((state) => {
          const newDeck: FlashcardDeck = {
            ...deck,
            id,
            userId: 'mock-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { decks: [...state.decks, newDeck] };
        });
        return id;
      },

      updateDeck: (id, deck) => {
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id
              ? { ...d, ...deck, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      deleteDeck: (id) => {
        set((state) => ({
          decks: state.decks.filter((d) => d.id !== id),
          flashcards: state.flashcards.filter((c) => c.deckId !== id),
        }));
      },

      addFlashcard: (card) => {
        const id = `fc_${Date.now()}`;
        set((state) => {
          const newCard: Flashcard = {
            ...card,
            id,
            userId: 'mock-user',
            box: 1,
            nextReviewDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            reps: 0,
            easeFactor: 2.5,
            interval: 0,
          };
          return { flashcards: [...state.flashcards, newCard] };
        });
        return id;
      },

      updateFlashcard: (id, card) => {
        set((state) => ({
          flashcards: state.flashcards.map((c) =>
            c.id === id
              ? { ...c, ...card, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      deleteFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter((c) => c.id !== id),
        }));
      },

      reviewFlashcard: (id, rating) => {
        set((state) => {
          const nowStr = new Date().toISOString();
          let nextHistoryEntry: ReviewHistoryEntry | null = null;

          const nextFlashcards = state.flashcards.map((c): Flashcard => {
            if (c.id !== id) return c;

            // Map Rating to SM-2 Quality Score (0 to 5)
            // 5: EASY (Perfect response)
            // 4: GOOD (Correct response after hesitation)
            // 3: HARD (Correct response with serious difficulty)
            // 1: AGAIN (Incorrect response, total blackout)
            let q = 4;
            if (rating === 'EASY') q = 5;
            else if (rating === 'GOOD') q = 4;
            else if (rating === 'HARD') q = 3;
            else if (rating === 'AGAIN') q = 1;

            // Calculate reps, easeFactor, interval
            let nextReps = c.reps || 0;
            let nextEaseFactor = c.easeFactor || 2.5;
            let nextInterval = c.interval || 0;

            if (q >= 3) {
              // Correct response
              if (nextReps === 0) {
                nextInterval = 1;
              } else if (nextReps === 1) {
                nextInterval = 6;
              } else {
                nextInterval = Math.round(nextInterval * nextEaseFactor);
              }
              nextReps += 1;
            } else {
              // Incorrect response (AGAIN)
              nextReps = 0;
              nextInterval = 1;
            }

            // Adjust Ease Factor (standard SM-2 equation)
            nextEaseFactor =
              nextEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
            if (nextEaseFactor < 1.3) {
              nextEaseFactor = 1.3;
            }

            // Keep Leitner Box synced for backward compatibility
            let nextBox = c.box;
            if (rating === 'EASY') nextBox = Math.min(c.box + 1, 5);
            else if (rating === 'GOOD') nextBox = Math.min(c.box + 1, 5);
            else if (rating === 'HARD') nextBox = Math.max(c.box - 1, 1);
            else if (rating === 'AGAIN') nextBox = 1;

            const nextReviewDate = new Date(
              Date.now() + nextInterval * 24 * 60 * 60 * 1000
            ).toISOString();

            // Create review history entry
            nextHistoryEntry = {
              id: `rev_${Date.now()}`,
              cardId: c.id,
              userId: 'mock-user',
              reviewedAt: nowStr,
              rating,
              interval: nextInterval,
              easeFactor: nextEaseFactor,
            };

            return {
              ...c,
              box: nextBox,
              reps: nextReps,
              easeFactor: nextEaseFactor,
              interval: nextInterval,
              lastReviewDate: nowStr,
              nextReviewDate,
              difficulty: (rating === 'AGAIN'
                ? 'HARD'
                : rating === 'HARD'
                  ? 'HARD'
                  : rating === 'GOOD'
                    ? 'MEDIUM'
                    : 'EASY') as 'HARD' | 'EASY' | 'MEDIUM',
              updatedAt: nowStr,
            };
          });

          return {
            flashcards: nextFlashcards,
            reviewHistory: nextHistoryEntry
              ? [nextHistoryEntry, ...(state.reviewHistory || [])]
              : state.reviewHistory || [],
          };
        });
      },

      resetFlashcardStore: () => {
        set({
          decks: DEFAULT_DECKS,
          flashcards: DEFAULT_FLASHCARDS,
          reviewHistory: [],
        });
      },
    }),
    {
      name: 'aelpt-flashcards-mock',
    }
  )
);
