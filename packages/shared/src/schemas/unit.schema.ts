import { z } from 'zod';

export const createUnitSchema = z.object({
  name: z
    .string()
    .min(1, 'Unit name is required')
    .max(100, 'Name must be under 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .or(z.literal('')),
  estimatedHours: z
    .number()
    .min(0, 'Estimated hours must be at least 0')
    .default(0),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
