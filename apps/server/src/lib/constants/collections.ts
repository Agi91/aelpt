export const COLLECTIONS = {
  USERS: 'users',
  SEMESTERS: 'semesters',
  SUBJECTS: 'subjects',
  STUDY_SESSIONS: 'study_sessions',
  REVISION_QUEUE: 'revision_queue',
  FLASHCARDS: 'flashcards',
  NOTES: 'notes',
  RESOURCES: 'resources',
  AI_CHATS: 'ai_chats',
  QUIZZES: 'quizzes',
  ANALYTICS: 'analytics',
  ACHIEVEMENTS: 'achievements',
} as const;

export const SUBCOLLECTIONS = {
  // Nested subcollections if any, e.g., topics under units, units under subjects, etc.
  // In our flat or nested design, let's declare them here.
  UNITS: 'units',
  TOPICS: 'topics',
  MESSAGES: 'messages', // For chat history
} as const;

export type Collection = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
export type Subcollection =
  (typeof SUBCOLLECTIONS)[keyof typeof SUBCOLLECTIONS];
