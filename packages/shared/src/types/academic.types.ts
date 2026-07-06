import { Difficulty } from '../constants/difficulty';
import { TopicStatus } from '../constants/status';

export interface Semester {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  semesterId: string;
  userId: string;
  name: string;
  code?: string;
  description?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  subjectId: string;
  userId: string;
  name: string;
  description?: string;
  estimatedHours: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  unitId: string;
  userId: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  status: TopicStatus;
  estimatedMinutes: number;
  tags: string[];
  understandingScore: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
}

export interface TopicResource {
  id: string;
  topicId: string;
  userId: string;
  name: string;
  url: string;
  type: 'link' | 'pdf' | 'video';
  createdAt: string;
  updatedAt: string;
}
