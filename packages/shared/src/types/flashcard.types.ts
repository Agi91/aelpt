export interface FlashcardDeck {
  id: string;
  userId: string;
  subjectId?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  userId: string;
  front: string;
  back: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  box: number; // Leitner box (1 to 5)
  nextReviewDate: string;
  lastReviewDate?: string;
  createdAt: string;
  updatedAt: string;
  reps: number; // SM-2 consecutive correct repetitions
  easeFactor: number; // SM-2 ease factor (default 2.5)
  interval: number; // SM-2 interval in days
}

export interface ReviewHistoryEntry {
  id: string;
  cardId: string;
  userId: string;
  reviewedAt: string;
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  interval: number;
  easeFactor: number;
}

export type CreateDeckInput = Omit<
  FlashcardDeck,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;
export type CreateFlashcardInput = Omit<
  Flashcard,
  | 'id'
  | 'userId'
  | 'box'
  | 'nextReviewDate'
  | 'lastReviewDate'
  | 'createdAt'
  | 'updatedAt'
  | 'reps'
  | 'easeFactor'
  | 'interval'
>;
