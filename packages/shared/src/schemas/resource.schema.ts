import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z
    .string()
    .min(2, 'Resource title must be at least 2 characters')
    .max(150),
  url: z
    .string()
    .url('Please enter a valid URL')
    .or(z.string().length(0))
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  category: z.enum(['BOOK', 'VIDEO', 'WEBSITE', 'PDF', 'OTHER']),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
});
