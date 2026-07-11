import { z } from 'zod';

export const QuizConfigSchema = z.object({
  semesterId: z.string().optional(),
  subjectId: z.string().optional(),
  unitId: z.string().optional(),
  topicId: z.string().optional(),
  numQuestions: z.number().int().min(1).max(50),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  questionTypes: z.array(z.enum(['MCQ', 'TF', 'FILL', 'SHORT'])),
  timeLimit: z.number().int().positive().optional(),
});
