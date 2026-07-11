export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  dueDate: string;
  subjectId?: string;
  topicId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  taskId?: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  targetMinutes: number;
  achievedMinutes: number;
  date: string; // YYYY-MM-DD
}

export interface StudyReminder {
  id: string;
  title: string;
  triggerTime: string;
  isTriggered: boolean;
  taskId?: string;
}

export interface PlannerFilter {
  subjectId: string; // "ALL" or subjectId
  priority: string; // "ALL" or TaskPriority
  status: string; // "ALL" or TaskStatus
  dateRange: 'ALL' | 'TODAY' | 'UPCOMING' | 'COMPLETED';
}
