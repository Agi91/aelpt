import { z } from 'zod';
import { DIFFICULTY } from '../constants/difficulty';
import { TOPIC_STATUS } from '../constants/status';

export const createTopicSchema = z.object({
  title: z
    .string()
    .min(1, 'Topic title is required')
    .max(100, 'Title must be under 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be under 1000 characters')
    .optional()
    .or(z.literal('')),
  difficulty: z.nativeEnum(DIFFICULTY, {
    errorMap: () => ({ message: 'Invalid difficulty value' }),
  }),
  status: z
    .nativeEnum(TOPIC_STATUS, {
      errorMap: () => ({ message: 'Invalid status value' }),
    })
    .default(TOPIC_STATUS.NOT_STARTED),
  estimatedMinutes: z
    .number()
    .min(0, 'Estimated minutes must be at least 0')
    .default(0),
  tags: z.array(z.string()).default([]),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
