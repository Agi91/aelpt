import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Semester, Subject, Unit, Topic } from '@aelpt/shared';

interface AcademicMockState {
  semesters: Semester[];
  subjects: Subject[];
  units: Unit[];
  topics: Topic[];

  // Semester Actions
  addSemester: (
    sem: Omit<Semester, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => string;
  updateSemester: (
    id: string,
    sem: Partial<Omit<Semester, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => void;
  deleteSemester: (id: string) => void;

  // Subject Actions
  addSubject: (
    semesterId: string,
    sub: Omit<
      Subject,
      'id' | 'semesterId' | 'userId' | 'progress' | 'createdAt' | 'updatedAt'
    >
  ) => string;
  updateSubject: (
    id: string,
    sub: Partial<
      Omit<Subject, 'id' | 'semesterId' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ) => void;
  deleteSubject: (id: string) => void;

  // Unit Actions
  addUnit: (
    subjectId: string,
    unit: Omit<
      Unit,
      'id' | 'subjectId' | 'userId' | 'progress' | 'createdAt' | 'updatedAt'
    >
  ) => string;
  updateUnit: (
    id: string,
    unit: Partial<
      Omit<Unit, 'id' | 'subjectId' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ) => void;
  deleteUnit: (id: string) => void;

  // Topic Actions
  addTopic: (
    unitId: string,
    topic: Omit<Topic, 'id' | 'unitId' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => string;
  updateTopic: (
    id: string,
    topic: Partial<
      Omit<Topic, 'id' | 'unitId' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ) => void;
  deleteTopic: (id: string) => void;
}

// Helper to calculate progress values dynamically based on child elements
function recalculateHierarchyProgress(
  subjects: Subject[],
  units: Unit[],
  topics: Topic[]
): { subjects: Subject[]; units: Unit[] } {
  // 1. Recalculate Unit progress based on Topic statuses
  const nextUnits = units.map((u) => {
    const unitTopics = topics.filter((t) => t.unitId === u.id);
    if (unitTopics.length === 0) return { ...u, progress: 0 };
    const done = unitTopics.filter((t) => t.status === 'COMPLETED').length;
    const progress = Math.round((done / unitTopics.length) * 100);
    return { ...u, progress };
  });

  // 2. Recalculate Subject progress based on Unit progress
  const nextSubjects = subjects.map((s) => {
    const subjectUnits = nextUnits.filter((u) => u.subjectId === s.id);
    if (subjectUnits.length === 0) return { ...s, progress: 0 };
    const totalProgress = subjectUnits.reduce(
      (acc, curr) => acc + curr.progress,
      0
    );
    const progress = Math.round(totalProgress / subjectUnits.length);
    return { ...s, progress };
  });

  return { subjects: nextSubjects, units: nextUnits };
}

export const useAcademicMockStore = create<AcademicMockState>()(
  persist(
    (set) => ({
      // Seed initial data
      semesters: [
        {
          id: 'sem-1',
          userId: 'user-1',
          name: 'Year 3 - Semester 1',
          startDate: '2026-07-01',
          endDate: '2026-12-20',
          description:
            'Focusing on database engines, operating systems, and basic algorithm design.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      subjects: [
        {
          id: 'sub-1',
          semesterId: 'sem-1',
          userId: 'user-1',
          name: 'Algorithms & Data Structures',
          code: 'CS301',
          description:
            'Focusing on sorting, graphs, dynamic programming, and algorithm paradigms.',
          progress: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sub-2',
          semesterId: 'sem-1',
          userId: 'user-1',
          name: 'Database Management Systems',
          code: 'CS302',
          description:
            'Relational algebra, normal forms, indexing structures, and transaction locks.',
          progress: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      units: [
        {
          id: 'unit-1',
          subjectId: 'sub-1',
          userId: 'user-1',
          name: 'Divide & Conquer Algorithms',
          description:
            'Core concepts of divide-and-conquer paradigm, recurrence systems, and master theorem.',
          estimatedHours: 12,
          progress: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'unit-2',
          subjectId: 'sub-1',
          userId: 'user-1',
          name: 'Graph Paradigms',
          description:
            'DFS, BFS, minimum spanning trees, and single-source shortest paths.',
          estimatedHours: 18,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'unit-3',
          subjectId: 'sub-2',
          userId: 'user-1',
          name: 'Relational Model & Keys',
          description:
            'Tuple relational calculus, integrity constraints, and database normalizations.',
          estimatedHours: 15,
          progress: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      topics: [
        {
          id: 'top-1',
          unitId: 'unit-1',
          userId: 'user-1',
          title: 'Merge Sort & Recurrence Tree',
          description:
            'Analysing recurrence relations using recursion trees and formal proofs.',
          difficulty: 'MEDIUM',
          status: 'COMPLETED',
          estimatedMinutes: 90,
          tags: ['Sorting', 'Recursion'],
          understandingScore: 92,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'top-2',
          unitId: 'unit-1',
          userId: 'user-1',
          title: 'Quick Sort Optimizations',
          description:
            'Pivot choices, randomized quicksort, and avoiding O(N^2) worst-case.',
          difficulty: 'HARD',
          status: 'IN_PROGRESS',
          estimatedMinutes: 120,
          tags: ['Sorting', 'Randomised'],
          understandingScore: 75,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'top-3',
          unitId: 'unit-2',
          userId: 'user-1',
          title: 'Dijkstra Single-Source Path',
          description:
            'Greedy shortest paths using binary heaps and Fibonacci heaps.',
          difficulty: 'HARD',
          status: 'NOT_STARTED',
          estimatedMinutes: 150,
          tags: ['Graphs', 'Greedy'],
          understandingScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'top-4',
          unitId: 'unit-3',
          userId: 'user-1',
          title: '3NF vs BCNF Normalization',
          description:
            'Lossless joins, dependency preservation, and decomposition algorithms.',
          difficulty: 'MEDIUM',
          status: 'COMPLETED',
          estimatedMinutes: 100,
          tags: ['Database', 'Theory'],
          understandingScore: 85,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      // Semester Actions
      addSemester: (sem) => {
        const id = `sem-${Date.now()}`;
        const newSem: Semester = {
          ...sem,
          id,
          userId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          semesters: [...state.semesters, newSem],
        }));
        return id;
      },
      updateSemester: (id, sem) => {
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id
              ? { ...s, ...sem, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },
      deleteSemester: (id) => {
        set((state) => {
          const nextSemesters = state.semesters.filter((s) => s.id !== id);
          // Cascade delete subjects, units, topics
          const affectedSubjects = state.subjects.filter(
            (s) => s.semesterId === id
          );
          const affectedSubjectIds = affectedSubjects.map((s) => s.id);
          const nextSubjects = state.subjects.filter(
            (s) => s.semesterId !== id
          );

          const affectedUnits = state.units.filter((u) =>
            affectedSubjectIds.includes(u.subjectId)
          );
          const affectedUnitIds = affectedUnits.map((u) => u.id);
          const nextUnits = state.units.filter(
            (u) => !affectedSubjectIds.includes(u.subjectId)
          );

          const nextTopics = state.topics.filter(
            (t) => !affectedUnitIds.includes(t.unitId)
          );

          return {
            semesters: nextSemesters,
            subjects: nextSubjects,
            units: nextUnits,
            topics: nextTopics,
          };
        });
      },

      // Subject Actions
      addSubject: (semesterId, sub) => {
        const id = `sub-${Date.now()}`;
        const newSub: Subject = {
          ...sub,
          id,
          semesterId,
          userId: 'user-1',
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          const nextSubjects = [...state.subjects, newSub];
          const { subjects, units } = recalculateHierarchyProgress(
            nextSubjects,
            state.units,
            state.topics
          );
          return { subjects, units };
        });
        return id;
      },
      updateSubject: (id, sub) => {
        set((state) => {
          const nextSubjects = state.subjects.map((s) =>
            s.id === id
              ? { ...s, ...sub, updatedAt: new Date().toISOString() }
              : s
          );
          const { subjects, units } = recalculateHierarchyProgress(
            nextSubjects,
            state.units,
            state.topics
          );
          return { subjects, units };
        });
      },
      deleteSubject: (id) => {
        set((state) => {
          const nextSubjects = state.subjects.filter((s) => s.id !== id);
          const affectedUnits = state.units.filter((u) => u.subjectId === id);
          const affectedUnitIds = affectedUnits.map((u) => u.id);
          const nextUnits = state.units.filter((u) => u.subjectId !== id);
          const nextTopics = state.topics.filter(
            (t) => !affectedUnitIds.includes(t.unitId)
          );

          const { subjects, units } = recalculateHierarchyProgress(
            nextSubjects,
            nextUnits,
            nextTopics
          );
          return { subjects, units, topics: nextTopics };
        });
      },

      // Unit Actions
      addUnit: (subjectId, unit) => {
        const id = `unit-${Date.now()}`;
        const newUnit: Unit = {
          ...unit,
          id,
          subjectId,
          userId: 'user-1',
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          const nextUnits = [...state.units, newUnit];
          const { subjects, units } = recalculateHierarchyProgress(
            state.subjects,
            nextUnits,
            state.topics
          );
          return { subjects, units };
        });
        return id;
      },
      updateUnit: (id, unit) => {
        set((state) => {
          const nextUnits = state.units.map((u) =>
            u.id === id
              ? { ...u, ...unit, updatedAt: new Date().toISOString() }
              : u
          );
          const { subjects, units } = recalculateHierarchyProgress(
            state.subjects,
            nextUnits,
            state.topics
          );
          return { subjects, units };
        });
      },
      deleteUnit: (id) => {
        set((state) => {
          const nextUnits = state.units.filter((u) => u.id !== id);
          const nextTopics = state.topics.filter((t) => t.unitId !== id);
          const { subjects, units } = recalculateHierarchyProgress(
            state.subjects,
            nextUnits,
            nextTopics
          );
          return { subjects, units, topics: nextTopics };
        });
      },

      // Topic Actions
      addTopic: (unitId, topic) => {
        const id = `top-${Date.now()}`;
        const newTopic: Topic = {
          ...topic,
          id,
          unitId,
          userId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          const nextTopics = [...state.topics, newTopic];
          const { subjects, units } = recalculateHierarchyProgress(
            state.subjects,
            state.units,
            nextTopics
          );
          return { subjects, units, topics: nextTopics };
        });
        return id;
      },
      updateTopic: (id, topic) => {
        set((state) => {
          const nextTopics = state.topics.map((t) =>
            t.id === id
              ? { ...t, ...topic, updatedAt: new Date().toISOString() }
              : t
          );
          const { subjects, units } = recalculateHierarchyProgress(
            state.subjects,
            state.units,
            nextTopics
          );
          return { subjects, units, topics: nextTopics };
        });
      },
      deleteTopic: (id) => {
        set((state) => {
          const nextTopics = state.topics.filter((t) => t.id !== id);
          const { subjects, units } = recalculateHierarchyProgress(
            state.subjects,
            state.units,
            nextTopics
          );
          return { subjects, units, topics: nextTopics };
        });
      },
    }),
    {
      name: 'aelpt-academic-mock',
    }
  )
);
