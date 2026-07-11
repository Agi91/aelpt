import { z } from 'zod';

export const WellnessLogSchema = z.object({
  id: z.string(),
  mood: z.number().min(1).max(5),
  energyLevel: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24),
  reflection: z.string(),
  date: z.string(),
  loggedAt: z.string(),
});
