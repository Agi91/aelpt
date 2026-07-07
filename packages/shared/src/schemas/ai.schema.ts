import { z } from 'zod';

export const AiRoleSchema = z.enum(['user', 'model', 'system']);

export const AiMessageSchema = z.object({
  role: AiRoleSchema,
  content: z.string().min(1, 'Message content cannot be empty'),
});

export const AiRequestOptionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().int().positive().optional(),
  stopSequences: z.array(z.string()).optional(),
  candidateCount: z.number().int().positive().optional(),
});

export const AiGenerateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  systemInstruction: z.string().optional(),
  history: z.array(AiMessageSchema).optional(),
  options: AiRequestOptionsSchema.optional(),
});
