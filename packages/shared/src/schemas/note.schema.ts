import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  content: z
    .string()
    .max(10000, 'Note content must not exceed 10,000 characters')
    .optional()
    .default(''),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  isPinned: z.boolean().optional().default(false),
  isFavorite: z.boolean().optional().default(false),
});
