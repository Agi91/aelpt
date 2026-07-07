'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  HelpCircle,
  Layers,
  RotateCw,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  PageHeader,
  EmptyState,
  SectionHeader,
  StatCard,
} from '@/components/common';
import { Flashcard } from '@aelpt/shared';

type QueueFilter = 'DUE' | 'MISSED' | 'LEARNING' | 'NEW' | 'MASTERED';

export default function RevisionPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueFilter>('DUE');

  // Stores
  const { decks, flashcards, reviewHistory, reviewFlashcard } =
    useFlashcardMockStore();
  const { subjects } = useAcademicMockStore();
  const { logTopicCompleted } = useProgressMockStore();

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Study Session state
  const [activeSessionQueue, setActiveSessionQueue] = useState<
    Flashcard[] | null
  >(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Revision"
          subtitle="Review your weak areas and due flashcards."
        />
        <div className="h-48 border border-border bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. QUEUE LOGICS & MATHS
  // ─────────────────────────────────────────────────────────────────────────────

  // Helper to map card to subject
  const getCardSubjectId = (card: Flashcard): string | undefined => {
    const deck = decks.find((d) => d.id === card.deckId);
    return deck?.subjectId;
  };

  // Base filtered cards by UI filters (Subject & Difficulty)
  const filteredBaseCards = flashcards.filter((card) => {
    const subjectId = getCardSubjectId(card);
    if (selectedSubjectId !== 'ALL' && subjectId !== selectedSubjectId)
      return false;
    if (selectedDifficulty !== 'ALL' && card.difficulty !== selectedDifficulty)
      return false;
    return true;
  });

  // Due Today: nextReviewDate <= now OR reps === 0 (new)
  const dueTodayCards = filteredBaseCards.filter(
    (c) => new Date(c.nextReviewDate) <= now || c.reps === 0
  );

  // Missed/Overdue: nextReviewDate < startOfToday AND reps > 0 (already due in past days)
  const missedCards = filteredBaseCards.filter((c) => {
    if (c.reps === 0) return false; // New cards are not "missed/overdue"
    const nextReview = new Date(c.nextReviewDate);
    return nextReview < startOfToday;
  });

  // Learning Queue: reps > 0 && reps < 4
  const learningCards = filteredBaseCards.filter(
    (c) => c.reps > 0 && c.reps < 4
  );

  // New Queue: reps === 0
  const newCards = filteredBaseCards.filter((c) => c.reps === 0);

  // Mastered Queue: reps >= 4
  const masteredCards = filteredBaseCards.filter((c) => c.reps >= 4);

  // ─────────────────────────────────────────────────────────────────────────────
  // REVISION METRICS & DAILY GOAL (e.g. 10 reviews target)
  // ─────────────────────────────────────────────────────────────────────────────
  const dailyGoalTarget = 10;

  const reviewsToday = reviewHistory.filter((rev) => {
    const revDate = new Date(rev.reviewedAt).toDateString();
    return revDate === now.toDateString();
  });

  const todayReviewsCount = reviewsToday.length;
  const goalProgressPercent = Math.min(
    Math.round((todayReviewsCount / dailyGoalTarget) * 100),
    100
  );

  // Accuracy (GOOD or EASY reviews)
  const accurateReviews = reviewsToday.filter(
    (r) => r.rating === 'GOOD' || r.rating === 'EASY'
  ).length;
  const todayAccuracy =
    todayReviewsCount > 0
      ? Math.round((accurateReviews / todayReviewsCount) * 100)
      : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // MOCK WEEKLY REVIEW CALENDAR
  // ─────────────────────────────────────────────────────────────────────────────
  const getCalendarScheduledDays = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);

      // Count scheduled cards where date matches
      const count = flashcards.filter(
        (c) => c.nextReviewDate.slice(0, 10) === dateStr
      ).length;
      return { dayName, count, isToday: i === 0 };
    });
  };
  const calendarDays = getCalendarScheduledDays();

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBJECT-WISE METRICS
  // ─────────────────────────────────────────────────────────────────────────────
  const subjectQueues = subjects.map((sub) => {
    const subDecks = decks.filter((d) => d.subjectId === sub.id);
    const subDeckIds = subDecks.map((d) => d.id);
    const subCards = flashcards.filter((c) => subDeckIds.includes(c.deckId));
    const dueCount = subCards.filter(
      (c) => new Date(c.nextReviewDate) <= now || c.reps === 0
    ).length;

    return {
      id: sub.id,
      name: sub.name,
      code: sub.code || 'SUBJ',
      dueCount,
      totalCount: subCards.length,
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDY SESSION FLOW HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const startSession = (queue: Flashcard[], title: string) => {
    setActiveSessionQueue(queue);
    setSessionTitle(title);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsSessionFinished(false);
  };

  const currentCard = activeSessionQueue
    ? activeSessionQueue[currentIdx]
    : null;

  const handleRatingSubmit = (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    if (!currentCard) return;

    reviewFlashcard(currentCard.id, rating);

    // Occasionally record completed topic in activity logs
    if (rating === 'EASY' || rating === 'GOOD') {
      logTopicCompleted(
        `Revision Session [${rating}]: ${currentCard.front.slice(0, 30)}...`
      );
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 < (activeSessionQueue?.length || 0)) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setIsSessionFinished(true);
      }
    }, 150);
  };

  const getSelectedTabQueue = (): Flashcard[] => {
    switch (activeQueueTab) {
      case 'MISSED':
        return missedCards;
      case 'LEARNING':
        return learningCards;
      case 'NEW':
        return newCards;
      case 'MASTERED':
        return masteredCards;
      default:
        return dueTodayCards;
    }
  };

  return (
    <div className="space-y-6">
      {activeSessionQueue ? (
        // ─────────────────────────────────────────────────────────────────────────────
        // REVISION STUDY PANEL
        // ─────────────────────────────────────────────────────────────────────────────
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSessionQueue(null)}
              className="text-xs gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Exit Revision
            </Button>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {sessionTitle}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isSessionFinished ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 space-y-4"
              >
                <div className="flex justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                    <CheckCircle className="h-10 w-10" />
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Revision Complete!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Spaced repetition spacing factors have been recalculated.
                    Keep up the consistent review!
                  </p>
                </div>
                <Button
                  onClick={() => setActiveSessionQueue(null)}
                  className="bg-purple-600 text-white hover:bg-purple-700 text-xs"
                >
                  Back to Revision Home
                </Button>
              </motion.div>
            ) : activeSessionQueue.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="h-8 w-8" />}
                title="Queue is empty"
                description="No cards available to review in this category."
                action={{
                  label: 'Go Back',
                  onClick: () => setActiveSessionQueue(null),
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Session Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                    <span>REVISION PROGRESS</span>
                    <span>
                      {currentIdx + 1} of {activeSessionQueue.length} Cards
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentIdx + 1) / activeSessionQueue.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3D Flip Card Container */}
                <div className="perspective-1000 w-full select-none">
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative w-full min-h-[300px] cursor-pointer"
                  >
                    {/* FRONT SIDE */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                      className="absolute inset-0 flex flex-col justify-between p-8 border border-border bg-card rounded-2xl shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground uppercase">
                          Question
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-1.5 py-0.2 rounded-full font-bold">
                            EF: {currentCard?.easeFactor.toFixed(1) ?? '2.5'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <RotateCw className="h-3.5 w-3.5 animate-pulse" />{' '}
                            Flip Card
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center text-center my-6">
                        <p className="text-base font-bold text-foreground leading-relaxed">
                          {currentCard?.front}
                        </p>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center">
                        Click card to flip
                      </div>
                    </div>

                    {/* BACK SIDE */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                      className="absolute inset-0 flex flex-col justify-between p-8 border border-border bg-zinc-950 text-white rounded-2xl shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold text-zinc-300 uppercase">
                          Answer
                        </span>
                        <span className="text-xs text-zinc-300 flex items-center gap-1">
                          <RotateCw className="h-3.5 w-3.5" /> Flip Card
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center text-center my-6">
                        <p className="text-base font-medium leading-relaxed">
                          {currentCard?.back}
                        </p>
                      </div>
                      <div className="text-[10px] text-zinc-400 text-center">
                        Rate your recall strength below
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Rating Controls */}
                <div className="flex justify-center gap-3">
                  {!isFlipped ? (
                    <Button
                      onClick={() => setIsFlipped(true)}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700 text-xs h-10 gap-1.5"
                    >
                      <RotateCw className="h-4 w-4" /> Show Answer
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                      <Button
                        onClick={() => handleRatingSubmit('AGAIN')}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Again</span>
                        <span className="text-[9px] opacity-75">
                          1d interval
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRatingSubmit('HARD')}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Hard</span>
                        <span className="text-[9px] opacity-75">Next rep</span>
                      </Button>
                      <Button
                        onClick={() => handleRatingSubmit('GOOD')}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Good</span>
                        <span className="text-[9px] opacity-75">Normal</span>
                      </Button>
                      <Button
                        onClick={() => handleRatingSubmit('EASY')}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Easy</span>
                        <span className="text-[9px] opacity-75">Bonus</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // ─────────────────────────────────────────────────────────────────────────────
        // REVISION HOME DASHBOARD
        // ─────────────────────────────────────────────────────────────────────────────
        <div className="space-y-6">
          <PageHeader
            title="Revision Center"
            subtitle="Spaced repetition recall system for active mastery calibration."
            actions={
              <Button
                onClick={() => startSession(dueTodayCards, 'Daily Goal Queue')}
                disabled={dueTodayCards.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 gap-1"
              >
                <Play className="h-3.5 w-3.5" />
                Start Due Reviews ({dueTodayCards.length})
              </Button>
            }
          />

          {/* Quick Metrics */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard
              title="Daily Goal"
              value={`${todayReviewsCount} / ${dailyGoalTarget} cards`}
              subtitle={
                todayReviewsCount >= dailyGoalTarget
                  ? 'Daily goal complete! 🎉'
                  : 'Reviews completed today'
              }
              icon={<Check className="h-4 w-4" />}
              accent="bg-purple-600/10 text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Overdue / Missed"
              value={`${missedCards.length} cards`}
              subtitle="Pending previous cycles"
              icon={<AlertTriangle className="h-4 w-4" />}
              accent="bg-rose-600/10 text-rose-600 dark:text-rose-400"
            />
            <StatCard
              title="Today's Accuracy"
              value={`${todayAccuracy}%`}
              subtitle="Good/Easy recall accuracy"
              icon={<TrendingUp className="h-4 w-4" />}
              accent="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              title="Active Learning Queue"
              value={`${learningCards.length} cards`}
              subtitle="Repeated recalls in progress"
              icon={<Clock className="h-4 w-4" />}
              accent="bg-blue-600/10 text-blue-600 dark:text-blue-400"
            />
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* LEFT COLUMN: Goals, Calendars, Subject Queues */}
            <div className="lg:col-span-1 space-y-6">
              {/* Daily Goal Card */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <SectionHeader title="Daily Study Goal" className="mb-0" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                      <span>PROGRESS</span>
                      <span>{goalProgressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${goalProgressPercent}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Review at least 10 cards daily to optimize long-term
                    cognitive retention factors.
                  </p>
                </CardContent>
              </Card>

              {/* Mock Calendar Grid */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <SectionHeader
                    title="Spacing Calendar"
                    subtitle="Reviews scheduled for next 7 days"
                    className="mb-0"
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center ${
                          day.isToday
                            ? 'bg-purple-600/10 border-purple-600 text-purple-600 dark:text-purple-400'
                            : 'border-border bg-card'
                        }`}
                      >
                        <span className="text-[10px] font-bold opacity-75">
                          {day.dayName}
                        </span>
                        <span
                          className={`text-xs font-extrabold mt-1 ${day.count > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`}
                        >
                          {day.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Queues */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <SectionHeader
                    title="Subject Review Cohorts"
                    className="mb-0"
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {subjectQueues.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No active subjects mapped.
                    </p>
                  ) : (
                    subjectQueues.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border bg-card text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate text-foreground">
                            {sub.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {sub.dueCount} cards due today
                          </p>
                        </div>
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={sub.dueCount === 0}
                          onClick={() => {
                            const subDecks = decks.filter(
                              (d) => d.subjectId === sub.id
                            );
                            const subDeckIds = subDecks.map((d) => d.id);
                            const subCards = flashcards.filter(
                              (c) =>
                                subDeckIds.includes(c.deckId) &&
                                (new Date(c.nextReviewDate) <= now ||
                                  c.reps === 0)
                            );
                            startSession(
                              subCards,
                              `Subject Queue: ${sub.code}`
                            );
                          }}
                          className="h-7 text-purple-600 dark:text-purple-400 hover:bg-transparent"
                        >
                          Review <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Filter + Main Queues list */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SectionHeader
                      title="Schedules & Queues Manager"
                      className="mb-0"
                    />
                    {/* Filters Row */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="text-[10px] font-semibold h-7 border border-input rounded-md bg-transparent px-2.5 py-0.5"
                      >
                        <option value="ALL">All Subjects</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.code || sub.name.slice(0, 10)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="text-[10px] font-semibold h-7 border border-input rounded-md bg-transparent px-2.5 py-0.5"
                      >
                        <option value="ALL">All Difficulties</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Queues Tab Selectors */}
                  <div className="flex gap-3 border-b border-border pt-4 text-xs font-semibold select-none">
                    <button
                      onClick={() => setActiveQueueTab('DUE')}
                      className={`pb-2 border-b-2 transition-colors ${
                        activeQueueTab === 'DUE'
                          ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Due Today ({dueTodayCards.length})
                    </button>
                    <button
                      onClick={() => setActiveQueueTab('MISSED')}
                      className={`pb-2 border-b-2 transition-colors ${
                        activeQueueTab === 'MISSED'
                          ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Overdue ({missedCards.length})
                    </button>
                    <button
                      onClick={() => setActiveQueueTab('NEW')}
                      className={`pb-2 border-b-2 transition-colors ${
                        activeQueueTab === 'NEW'
                          ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      New ({newCards.length})
                    </button>
                    <button
                      onClick={() => setActiveQueueTab('LEARNING')}
                      className={`pb-2 border-b-2 transition-colors ${
                        activeQueueTab === 'LEARNING'
                          ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Learning ({learningCards.length})
                    </button>
                    <button
                      onClick={() => setActiveQueueTab('MASTERED')}
                      className={`pb-2 border-b-2 transition-colors ${
                        activeQueueTab === 'MASTERED'
                          ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Mastered ({masteredCards.length})
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {getSelectedTabQueue().length === 0 ? (
                    <EmptyState
                      icon={<Layers className="h-6 w-6" />}
                      title="No cards in queue"
                      description="All clear for this selection!"
                    />
                  ) : (
                    <div className="space-y-3">
                      {getSelectedTabQueue().map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 border border-border bg-card rounded-xl text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="font-bold text-foreground truncate">
                              {c.front}
                            </p>
                            <div className="flex gap-2 text-[10px] text-muted-foreground mt-1 flex-wrap">
                              <span>EF: {c.easeFactor.toFixed(1)}</span>
                              <span>•</span>
                              <span>Interval: {c.interval}d</span>
                              <span>•</span>
                              <span>Difficulty: {c.difficulty}</span>
                            </div>
                          </div>
                          <Button
                            size="xs"
                            onClick={() =>
                              startSession([c], 'Single Card Practice')
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white h-7 shrink-0 text-[10px] font-bold"
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
