export interface Note {
  id: string;
  userId: string;
  subjectId?: string;
  topicId?: string;
  title: string;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  userId: string;
  subjectId?: string;
  topicId?: string;
  title: string;
  url?: string;
  description?: string;
  category: 'BOOK' | 'VIDEO' | 'WEBSITE' | 'PDF' | 'OTHER';
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
  isFavorite: boolean;
  tags: string[];
  fileSize?: string;
  fileType?: string;
  lastViewedAt?: string;
}

export type CreateNoteInput = Omit<
  Note,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;
export type CreateResourceInput = Omit<
  Resource,
  | 'id'
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
  | 'isBookmarked'
  | 'isFavorite'
  | 'tags'
  | 'fileSize'
  | 'fileType'
  | 'lastViewedAt'
>;
