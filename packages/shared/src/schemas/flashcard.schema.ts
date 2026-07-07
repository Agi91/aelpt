import { z } from 'zod';

export const createFlashcardSchema = z.object({
  deckId: z.string().min(1, 'Please select a deck'),
  front: z
    .string()
    .min(2, 'Front side must be at least 2 characters long')
    .max(1000),
  back: z
    .string()
    .min(2, 'Back side must be at least 2 characters long')
    .max(2000),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
});
