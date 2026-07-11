import { GamificationAchievement } from '../types/gamification.types';

export const XP_REWARDS = {
  COMPLETE_TOPIC: 100,
  COMPLETE_UNIT: 250,
  COMPLETE_SUBJECT: 500,
  TAKE_QUIZ: 150,
  QUIZ_PERFECT_BONUS: 100,
  QUIZ_HIGH_BONUS: 50,
  REVIEW_FLASHCARD: 5,
  CREATE_NOTE: 50,
  UPLOAD_RESOURCE: 75,
  STUDY_SESSION_MINUTE: 2,
  DAILY_LOGIN: 50,
};

export class GamificationEngine {
  /**
   * Computes user level, title, and progress percentage based on total XP.
   */
  static getLevelDetails(totalXp: number): {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercent: number;
    title: string;
  } {
    const level = Math.floor(totalXp / 1000) + 1;
    const currentLevelXp = totalXp % 1000;
    const nextLevelXp = 1000;
    const progressPercent = Math.min(
      100,
      Math.round((currentLevelXp / nextLevelXp) * 100)
    );

    let title = 'Beginner';
    if (level === 2) {
      title = 'Learner';
    } else if (level === 3) {
      title = 'Scholar';
    } else if (level === 4) {
      title = 'Expert';
    } else if (level >= 5) {
      title = 'Master';
    }

    return {
      level,
      currentLevelXp,
      nextLevelXp,
      progressPercent,
      title,
    };
  }

  /**
   * Evaluates if any achievement thresholds have been crossed.
   */
  static evaluateAchievements(
    currentAchievements: GamificationAchievement[],
    stats: {
      totalXp: number;
      streakCount: number;
      completedTopicsCount: number;
      completedQuizzesCount: number;
      reviewedFlashcardsCount: number;
      createdNotesCount: number;
    }
  ): {
    updatedAchievements: GamificationAchievement[];
    newlyUnlockedIds: string[];
  } {
    const newlyUnlockedIds: string[] = [];
    const now = new Date().toISOString();

    const updatedAchievements = currentAchievements.map((ach) => {
      if (ach.unlockedAt) {
        return ach;
      }

      let progress = 0;
      let shouldUnlock = false;

      if (ach.id === 'first_login') {
        progress = 100;
        shouldUnlock = true;
      } else if (ach.id === 'first_topic') {
        progress = stats.completedTopicsCount >= 1 ? 100 : 0;
        shouldUnlock = stats.completedTopicsCount >= 1;
      } else if (ach.id === 'quiz_master') {
        progress = Math.min(
          100,
          Math.round((stats.completedQuizzesCount / 5) * 100)
        );
        shouldUnlock = stats.completedQuizzesCount >= 5;
      } else if (ach.id === 'flashcard_expert') {
        progress = Math.min(
          100,
          Math.round((stats.reviewedFlashcardsCount / 50) * 100)
        );
        shouldUnlock = stats.reviewedFlashcardsCount >= 50;
      } else if (ach.id === 'streak_warrior') {
        progress = Math.min(100, Math.round((stats.streakCount / 5) * 100));
        shouldUnlock = stats.streakCount >= 5;
      } else if (ach.id === 'xp_100') {
        progress = Math.min(100, Math.round((stats.totalXp / 100) * 100));
        shouldUnlock = stats.totalXp >= 100;
      } else if (ach.id === 'xp_1000') {
        progress = Math.min(100, Math.round((stats.totalXp / 1000) * 100));
        shouldUnlock = stats.totalXp >= 1000;
      } else if (ach.id === 'xp_5000') {
        progress = Math.min(100, Math.round((stats.totalXp / 5000) * 100));
        shouldUnlock = stats.totalXp >= 5000;
      }

      if (shouldUnlock) {
        newlyUnlockedIds.push(ach.id);
        return {
          ...ach,
          progress: 100,
          unlockedAt: now,
        };
      }

      return {
        ...ach,
        progress,
      };
    });

    return {
      updatedAchievements,
      newlyUnlockedIds,
    };
  }
}
