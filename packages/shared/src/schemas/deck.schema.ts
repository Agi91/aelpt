import { z } from 'zod';

export const createDeckSchema = z.object({
  name: z
    .string()
    .min(3, 'Deck name must be at least 3 characters long')
    .max(100),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  subjectId: z.string().optional(),
});
