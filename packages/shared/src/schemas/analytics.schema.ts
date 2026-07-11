import { z } from 'zod';

export const KPIStatsSchema = z.object({
  totalStudyHours: z.number(),
  topicsCompleted: z.number(),
  quizzesCompleted: z.number(),
  flashcardsReviewed: z.number(),
  notesCreated: z.number(),
  currentStreak: z.number(),
  xpEarned: z.number(),
  currentLevel: z.number(),
});
