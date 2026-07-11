import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  StudyTask,
  StudySession,
  StudyGoal,
  StudyReminder,
  PlannerEngine,
  Topic,
  Subject,
  StudySuggestion,
} from '@aelpt/shared';
import { toast } from 'sonner';

interface PlannerMockState {
  tasks: StudyTask[];
  sessions: StudySession[];
  goals: StudyGoal[];
  reminders: StudyReminder[];
  dailyPlan: string[]; // List of task IDs
  weeklyPlan: string[]; // List of task IDs

  addTask: (
    task: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt' | 'actualTime'>
  ) => void;
  editTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  archiveTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  addSession: (session: Omit<StudySession, 'id'>) => void;
  addGoal: (goal: Omit<StudyGoal, 'id' | 'achievedMinutes'>) => void;
  updateGoalProgress: (date: string, minutes: number) => void;
  generatePlans: (
    topics: Topic[],
    subjects: Subject[],
    suggestions: StudySuggestion[],
    dueCount: number
  ) => void;
  clearPlannerStore: () => void;
}

const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'task_default_1',
    title: 'Study TCP/IP Reference Model Layers',
    description:
      'Understand encapsulation and protocols active in Network vs Transport layers.',
    priority: 'HIGH',
    status: 'TODO',
    estimatedTime: 45,
    actualTime: 0,
    dueDate: new Date().toISOString().split('T')[0]!,
    tags: ['Syllabus', 'Networks'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_default_2',
    title: 'Review Software Development Lifecycle Models',
    description: 'Compare Agile, Waterfall, and Spiral methodologies.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    estimatedTime: 30,
    actualTime: 15,
    dueDate: new Date().toISOString().split('T')[0]!,
    tags: ['SDLC', 'Revision'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_default_3',
    title: 'Practice OS Process Synchronization MCQs',
    description: 'Solve interactive quizzes related to Semaphores and Mutexes.',
    priority: 'HIGH',
    status: 'COMPLETED',
    estimatedTime: 25,
    actualTime: 25,
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]!,
    tags: ['OS', 'Quiz'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const usePlannerMockStore = create<PlannerMockState>()(
  persist(
    (set, get) => ({
      tasks: DEFAULT_TASKS,
      sessions: [],
      goals: [
        {
          id: 'goal_today',
          title: 'Daily study goals limit',
          targetMinutes: 60,
          achievedMinutes: 15,
          date: new Date().toISOString().split('T')[0]!,
        },
      ],
      reminders: [],
      dailyPlan: ['task_default_1', 'task_default_2'],
      weeklyPlan: ['task_default_1', 'task_default_2', 'task_default_3'],

      addTask: (task) => {
        const newTask: StudyTask = {
          ...task,
          id: `task_${Date.now()}`,
          actualTime: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
          dailyPlan:
            newTask.dueDate === new Date().toISOString().split('T')[0]
              ? [...state.dailyPlan, newTask.id]
              : state.dailyPlan,
        }));
        toast.success(`Task "${task.title}" added to planner!`);
      },

      editTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
        toast.success('Task details updated.');
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          dailyPlan: state.dailyPlan.filter((tid) => tid !== id),
          weeklyPlan: state.weeklyPlan.filter((tid) => tid !== id),
        }));
        toast.warning('Task removed from planner.');
      },

      completeTask: (id) => {
        set((state) => {
          const completedTask = state.tasks.find((t) => t.id === id);
          if (completedTask) {
            toast.success(`🎉 Completed: "${completedTask.title}"!`);
            // Add actual study hours to goals
            const today = new Date().toISOString().split('T')[0]!;
            setTimeout(
              () =>
                get().updateGoalProgress(today, completedTask.estimatedTime),
              100
            );
          }
          return {
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: 'COMPLETED' as const,
                    actualTime: t.estimatedTime,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            ),
          };
        });
      },

      archiveTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'ARCHIVED' as const,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        toast.success('Task archived.');
      },

      duplicateTask: (id) => {
        const target = get().tasks.find((t) => t.id === id);
        if (target) {
          get().addTask({
            title: `${target.title} (Copy)`,
            description: target.description,
            priority: target.priority,
            status: 'TODO',
            estimatedTime: target.estimatedTime,
            dueDate: target.dueDate,
            ...(target.subjectId !== undefined
              ? { subjectId: target.subjectId }
              : {}),
            ...(target.topicId !== undefined
              ? { topicId: target.topicId }
              : {}),
            tags: [...target.tags],
          });
        }
      },

      addSession: (session) => {
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id: `session_${Date.now()}` },
          ],
        }));
      },

      addGoal: (goal) => {
        set((state) => ({
          goals: [
            ...state.goals,
            { ...goal, id: `goal_${Date.now()}`, achievedMinutes: 0 },
          ],
        }));
      },

      updateGoalProgress: (date, minutes) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.date === date
              ? { ...g, achievedMinutes: g.achievedMinutes + minutes }
              : g
          ),
        }));
      },

      generatePlans: (topics, subjects, suggestions, dueCount) => {
        const generated = PlannerEngine.generateRecommendedTasks({
          topics,
          subjects,
          suggestions,
          dueFlashcardsCount: dueCount,
        });

        set((state) => {
          // Avoid duplicate task titles
          const currentTitles = new Set(
            state.tasks.map((t) => t.title.toLowerCase())
          );
          const newTasks = generated.filter(
            (t) => !currentTitles.has(t.title.toLowerCase())
          );

          if (newTasks.length === 0) {
            toast.info(
              'Study tasks are already up-to-date with active recommendations.'
            );
            return {};
          }

          toast.success(
            `Smart Planner generated ${newTasks.length} custom tasks for you!`
          );
          return {
            tasks: [...newTasks, ...state.tasks],
            dailyPlan: [...state.dailyPlan, ...newTasks.map((t) => t.id)],
          };
        });
      },

      clearPlannerStore: () => {
        set({
          tasks: [],
          sessions: [],
          goals: [],
          reminders: [],
          dailyPlan: [],
          weeklyPlan: [],
        });
      },
    }),
    {
      name: 'aelpt-planner-mock',
    }
  )
);
