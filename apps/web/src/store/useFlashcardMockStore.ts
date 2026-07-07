import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Flashcard,
  FlashcardDeck,
  CreateDeckInput,
  CreateFlashcardInput,
} from '@aelpt/shared';

interface FlashcardMockState {
  decks: FlashcardDeck[];
  flashcards: Flashcard[];

  // Deck Actions
  addDeck: (deck: CreateDeckInput) => string;
  updateDeck: (id: string, deck: Partial<CreateDeckInput>) => void;
  deleteDeck: (id: string) => void;

  // Flashcard Actions
  addFlashcard: (card: CreateFlashcardInput) => string;
  updateFlashcard: (id: string, card: Partial<CreateFlashcardInput>) => void;
  deleteFlashcard: (id: string) => void;

  // Study/Recall Reviews (Leitner Box System)
  reviewFlashcard: (id: string, rating: 'EASY' | 'MEDIUM' | 'HARD') => void;
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
  },
];

export const useFlashcardMockStore = create<FlashcardMockState>()(
  persist(
    (set) => ({
      decks: DEFAULT_DECKS,
      flashcards: DEFAULT_FLASHCARDS,

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
          const flashcards = state.flashcards.map((c) => {
            if (c.id !== id) return c;

            // Leitner box adjustments
            let nextBox = c.box;
            let daysToAdd = 1;

            if (rating === 'EASY') {
              nextBox = Math.min(c.box + 1, 5);
            } else if (rating === 'HARD') {
              nextBox = Math.max(c.box - 1, 1);
            }

            // Leitner Box scheduling: Box 1 = 1 day, Box 2 = 3 days, Box 3 = 7 days, Box 4 = 14 days, Box 5 = 30 days
            if (nextBox === 1) daysToAdd = 1;
            else if (nextBox === 2) daysToAdd = 3;
            else if (nextBox === 3) daysToAdd = 7;
            else if (nextBox === 4) daysToAdd = 14;
            else if (nextBox === 5) daysToAdd = 30;

            const nextReviewDate = new Date(
              Date.now() + daysToAdd * 24 * 60 * 60 * 1000
            ).toISOString();

            return {
              ...c,
              box: nextBox,
              lastReviewDate: new Date().toISOString(),
              nextReviewDate,
              difficulty: rating,
              updatedAt: new Date().toISOString(),
            };
          });

          return { flashcards };
        });
      },

      resetFlashcardStore: () => {
        set({
          decks: DEFAULT_DECKS,
          flashcards: DEFAULT_FLASHCARDS,
        });
      },
    }),
    {
      name: 'aelpt-flashcards-mock',
    }
  )
);
