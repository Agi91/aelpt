import { z } from 'zod';

export const StudySuggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum([
    'STUDY_TOPIC',
    'REVISE_UNIT',
    'PRACTICE_QUIZ',
    'REVIEW_FLASHCARDS',
    'READ_NOTE',
    'IMPROVE_WEAK_CONCEPT',
  ]),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  reason: z.enum([
    'LOW_UNDERSTANDING',
    'QUIZ_FAILED',
    'INACTIVE_LONG',
    'DUE_REVISION',
    'DECK_DUE',
    'SEMANTIC_SIMILARITY',
  ]),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0.0).max(1.0),
  generatedAt: z.string(),
  relatedTopicId: z.string().optional(),
  relatedSubjectId: z.string().optional(),
  sourceReference: z.string().optional(),
});
