import { z } from 'zod';

export const NoteChunkSchema = z.object({
  id: z.string(),
  noteId: z.string(),
  topicId: z.string().optional(),
  content: z.string().min(1),
  embedding: z.array(z.number()),
  chunkIndex: z.number().nonnegative(),
  tokenCount: z.number().positive(),
  createdAt: z.string(),
});
