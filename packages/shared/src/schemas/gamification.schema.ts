import { z } from 'zod';

export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.string().optional(),
});
