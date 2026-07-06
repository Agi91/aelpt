import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Name must be under 100 characters'),
  code: z
    .string()
    .max(20, 'Code must be under 20 characters')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
