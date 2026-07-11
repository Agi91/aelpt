import { Topic, Subject, Unit } from '../types/academic.types';
import { Note, Resource } from '../types/notes.types';
import { Flashcard } from '../types/flashcard.types';
import { QuizHistoryEntry } from '../types/quiz.types';
import {
  StudySuggestion,
  DailyStudyPlan,
  RecommendationPayload,
  RecommendationPriority,
} from '../types/recommendation.types';

export class RecommendationEngine {
  /**
   * Generates a personalized set of study suggestions and daily goals deterministically.
   */
  static generateRecommendations(inputs: {
    topics: Topic[];
    subjects: Subject[];
    units: Unit[];
    notes: Note[];
    resources: Resource[];
    flashcards: Flashcard[];
    quizHistory: QuizHistoryEntry[];
    streakCount: number;
  }): RecommendationPayload {
    const {
      topics,
      subjects,
      units,
      notes,
      resources,
      flashcards,
      quizHistory,
      streakCount,
    } = inputs;
    const suggestions: StudySuggestion[] = [];
    const generatedAt = new Date().toISOString();

    // Helper to map topic to subjectId
    const getTopicSubjectId = (topic: Topic): string | undefined => {
      const unit = units.find((u) => u.id === topic.unitId);
      return unit?.subjectId;
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. RULE: LOW UNDERSTANDING TOPICS (LOW_UNDERSTANDING)
    // ─────────────────────────────────────────────────────────────────────────────
    const weakTopics = topics.filter((t) => t.understandingScore < 70);
    for (const topic of weakTopics) {
      const subId = getTopicSubjectId(topic);
      const subjectCode =
        subjects.find((s) => s.id === subId)?.code || 'Course';

      const score = 100 - topic.understandingScore; // lower score = higher recommendation priority
      const priority: RecommendationPriority =
        score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';

      // Check if they also failed a quiz on this topic to raise confidence
      const hasFailedQuiz = quizHistory.some(
        (h) => h.quiz.topicId === topic.id && h.result.score < 70
      );
      const confidence = hasFailedQuiz ? 0.95 : 0.8;

      suggestions.push({
        id: `rec_weak_${topic.id}`,
        title: `Study weak topic: ${topic.title}`,
        description: `Your self-understanding score is currently ${topic.understandingScore}% for this topic in ${subjectCode}. Dedicate some focus to bridge key gaps.`,
        category: 'STUDY_TOPIC',
        priority,
        reason: 'LOW_UNDERSTANDING',
        score,
        confidence,
        generatedAt,
        ...(topic.id !== undefined ? { relatedTopicId: topic.id } : {}),
        ...(subId !== undefined ? { relatedSubjectId: subId } : {}),
        sourceReference: `Academic Track > ${subjectCode}`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. RULE: FAILED QUIZZES (QUIZ_FAILED)
    // ─────────────────────────────────────────────────────────────────────────────
    const failedQuizzes = quizHistory.filter((h) => h.result.score < 60);
    const uniqueFailedTopics = new Set<string>();

    for (const fail of failedQuizzes) {
      const tId = fail.quiz.topicId;
      if (tId && !uniqueFailedTopics.has(tId)) {
        uniqueFailedTopics.add(tId);
        const topic = topics.find((t) => t.id === tId);
        if (topic) {
          const subId = getTopicSubjectId(topic);
          const subjectCode =
            subjects.find((s) => s.id === subId)?.code || 'Course';

          suggestions.push({
            id: `rec_failed_quiz_${tId}`,
            title: `Re-evaluate concepts: ${topic.title}`,
            description: `You scored ${fail.result.score}% in a recent quiz on this topic in ${subjectCode}. Practice questions and review correct answer explanations.`,
            category: 'IMPROVE_WEAK_CONCEPT',
            priority: 'HIGH',
            reason: 'QUIZ_FAILED',
            score: 90,
            confidence: 0.9,
            generatedAt,
            ...(tId !== undefined ? { relatedTopicId: tId } : {}),
            ...(subId !== undefined ? { relatedSubjectId: subId } : {}),
            sourceReference: `Quiz History Attempt`,
          });
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. RULE: DUE REVISIONS (DUE_REVISION)
    // ─────────────────────────────────────────────────────────────────────────────
    const revisionTopics = topics.filter(
      (t) => t.status === 'REVISION_REQUIRED'
    );
    for (const topic of revisionTopics) {
      const subId = getTopicSubjectId(topic);

      const relatedNote = notes.find((n) => n.topicId === topic.id);

      suggestions.push({
        id: `rec_rev_${topic.id}`,
        title: `Revise: ${topic.title}`,
        description: relatedNote
          ? `Read your study notes for "${relatedNote.title}" to reinforce critical memory connections.`
          : `Review course materials and unit resources for this topic to flag it as complete.`,
        category: 'READ_NOTE',
        priority: 'MEDIUM',
        reason: 'DUE_REVISION',
        score: 70,
        confidence: 0.85,
        generatedAt,
        ...(topic.id !== undefined ? { relatedTopicId: topic.id } : {}),
        ...(subId !== undefined ? { relatedSubjectId: subId } : {}),
        sourceReference: relatedNote
          ? `Study Note: ${relatedNote.title}`
          : `Topic Syllabus`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. RULE: OVERDUE FLASHCARDS (DECK_DUE)
    // ─────────────────────────────────────────────────────────────────────────────
    const now = new Date();
    const dueCardsCount = flashcards.filter(
      (c) => new Date(c.nextReviewDate) <= now || c.reps === 0
    ).length;

    if (dueCardsCount > 0) {
      const score = Math.min(100, 50 + dueCardsCount * 5); // caps at 100
      const priority: RecommendationPriority =
        score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';

      suggestions.push({
        id: 'rec_flashcards_overdue',
        title: 'Review Due Flashcards',
        description: `You have ${dueCardsCount} flashcards scheduled for recall reviews today using the SM-2 algorithm.`,
        category: 'REVIEW_FLASHCARDS',
        priority,
        reason: 'DECK_DUE',
        score,
        confidence: 0.95,
        generatedAt,
        sourceReference: 'Spaced Repetition Decks',
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. RULE: SEMANTIC RECOMMENDATION FROM RESOURCES (SEMANTIC_SIMILARITY)
    // ─────────────────────────────────────────────────────────────────────────────
    if (weakTopics.length > 0 && resources.length > 0) {
      const weakest = weakTopics.sort(
        (a, b) => a.understandingScore - b.understandingScore
      )[0];
      if (weakest) {
        const matchingResource = resources.find(
          (r) => r.topicId === weakest.id
        );
        if (matchingResource) {
          const subId = getTopicSubjectId(weakest);
          suggestions.push({
            id: `rec_sem_res_${matchingResource.id}`,
            title: `Examine reference material: ${matchingResource.title}`,
            description: `Review this recommended reference resource to boost comprehension of "${weakest.title}".`,
            category: 'READ_NOTE',
            priority: 'MEDIUM',
            reason: 'SEMANTIC_SIMILARITY',
            score: 65,
            confidence: 0.8,
            generatedAt,
            ...(weakest.id !== undefined ? { relatedTopicId: weakest.id } : {}),
            ...(subId !== undefined ? { relatedSubjectId: subId } : {}),
            sourceReference: `Course Resource [${matchingResource.category}]`,
          });
        }
      }
    }

    const sortedSuggestions = suggestions.sort((a, b) => b.score - a.score);

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. COMPILE DAILY STUDY PLAN
    // ─────────────────────────────────────────────────────────────────────────────
    const dailyGoals: string[] = [];
    let estimatedMinutes = 0;
    const recommendedOrder: string[] = [];
    const revisionReminders: string[] = [];

    const topSuggestions = sortedSuggestions.slice(0, 3);
    for (const sug of topSuggestions) {
      recommendedOrder.push(sug.id);

      if (sug.category === 'REVIEW_FLASHCARDS') {
        dailyGoals.push('Complete due flashcard recall sessions');
        estimatedMinutes += 15;
      } else if (sug.category === 'STUDY_TOPIC') {
        dailyGoals.push(sug.title);
        estimatedMinutes += 30;
      } else if (sug.category === 'IMPROVE_WEAK_CONCEPT') {
        dailyGoals.push(
          `Review mock quiz details for: ${sug.title.replace('Re-evaluate concepts: ', '')}`
        );
        estimatedMinutes += 20;
      } else {
        dailyGoals.push(sug.title);
        estimatedMinutes += 15;
      }
    }

    if (dailyGoals.length === 0) {
      dailyGoals.push('Explore new semester courses and syllabus topics');
      estimatedMinutes = 15;
    }

    if (streakCount > 0) {
      revisionReminders.push(
        `Your study streak is at ${streakCount} active days! Keep it up today!`
      );
    } else {
      revisionReminders.push(
        'Initialize your streak by completing a recall review session today.'
      );
    }

    if (dueCardsCount > 5) {
      revisionReminders.push(
        `Recall load warning: ${dueCardsCount} flashcards are due. Review them before they accumulate.`
      );
    }

    const dailyPlan: DailyStudyPlan = {
      id: `plan_${Date.now()}`,
      dailyGoals,
      estimatedMinutes,
      recommendedOrder,
      revisionReminders,
      generatedAt,
    };

    return {
      suggestions: sortedSuggestions,
      dailyPlan,
      generatedAt,
    };
  }
}
