import { Topic, Subject } from '../types/academic.types';
import { StudySuggestion } from '../types/recommendation.types';
import { StudyTask } from '../types/planner.types';

export class PlannerEngine {
  /**
   * Generates a recommended set of Study Tasks based on weak syllabus areas, due cards, and recommendation inputs.
   */
  static generateRecommendedTasks(inputs: {
    topics: Topic[];
    subjects: Subject[];
    suggestions: StudySuggestion[];
    dueFlashcardsCount: number;
  }): StudyTask[] {
    const { topics, subjects, suggestions, dueFlashcardsCount } = inputs;
    const tasks: StudyTask[] = [];
    const now = new Date();
    const createdStr = now.toISOString();

    // 1. Task for Due Flashcards
    if (dueFlashcardsCount > 0) {
      tasks.push({
        id: `task_gen_flash_${Date.now()}`,
        title: 'Review Due Flashcard Decks',
        description: `Complete reviews for your ${dueFlashcardsCount} active due cards using spaced repetition intervals.`,
        priority: 'HIGH',
        status: 'TODO',
        estimatedTime: Math.min(60, Math.round(15 + dueFlashcardsCount * 0.5)),
        actualTime: 0,
        dueDate: now.toISOString().split('T')[0]!,
        tags: ['Flashcards', 'Revision'],
        createdAt: createdStr,
        updatedAt: createdStr,
      });
    }

    // 2. Tasks based on AI recommendations (top 3)
    const topRecs = suggestions.slice(0, 3);
    topRecs.forEach((rec, idx) => {
      const relatedSubject = subjects.find(
        (s) => s.id === rec.relatedSubjectId
      );

      const isHighPriority = rec.priority === 'HIGH';
      const minsEst = isHighPriority ? 45 : 30;

      tasks.push({
        id: `task_gen_rec_${rec.id}_${idx}`,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        status: 'TODO',
        estimatedTime: minsEst,
        actualTime: 0,
        dueDate: now.toISOString().split('T')[0]!,
        ...(rec.relatedSubjectId !== undefined
          ? { subjectId: rec.relatedSubjectId }
          : {}),
        ...(rec.relatedTopicId !== undefined
          ? { topicId: rec.relatedTopicId }
          : {}),
        tags:
          relatedSubject && relatedSubject.code
            ? ['Syllabus', relatedSubject.code]
            : ['Syllabus'],
        createdAt: createdStr,
        updatedAt: createdStr,
      });
    });

    // 3. Tasks based on lowest understanding topics
    const weakTopics = topics
      .filter(
        (t) =>
          t.understandingScore < 60 &&
          !topRecs.some((r) => r.relatedTopicId === t.id)
      )
      .slice(0, 2);

    weakTopics.forEach((topic, idx) => {
      const dueDate = new Date();
      dueDate.setDate(now.getDate() + idx + 1); // schedule for tomorrow / day after

      tasks.push({
        id: `task_gen_weak_${topic.id}`,
        title: `Reinforce topic: ${topic.title}`,
        description: `Self-mastery score is currently ${topic.understandingScore}%. Re-read notes, outline concepts, and practice quizzes.`,
        priority: 'MEDIUM',
        status: 'TODO',
        estimatedTime: 40,
        actualTime: 0,
        dueDate: dueDate.toISOString().split('T')[0]!,
        ...(topic.id !== undefined ? { topicId: topic.id } : {}),
        tags: ['Concept Map', 'Weak Area'],
        createdAt: createdStr,
        updatedAt: createdStr,
      });
    });

    return tasks;
  }
}
