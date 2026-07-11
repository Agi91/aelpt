import { z } from 'zod';

export const StudyTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
  estimatedTime: z.number().min(0),
  actualTime: z.number().min(0),
  dueDate: z.string(),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
