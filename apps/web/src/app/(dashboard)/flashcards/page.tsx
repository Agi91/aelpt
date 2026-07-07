'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Layers,
  Search,
  Trash2,
  Edit2,
  ChevronLeft,
  ArrowRight,
  RotateCw,
  CheckCircle,
  HelpCircle,
  Clock,
  TrendingUp,
  Calendar,
  Layers3,
  Award,
} from 'lucide-react';
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PageHeader,
  EmptyState,
  ConfirmDialog,
  StatCard,
} from '@/components/common';
import { DeckForm } from '@/components/forms/DeckForm';
import { FlashcardForm } from '@/components/forms/FlashcardForm';
import {
  CreateDeckInput,
  CreateFlashcardInput,
  FlashcardDeck,
  Flashcard,
} from '@aelpt/shared';

type ActiveTab = 'DECKS' | 'QUEUES' | 'HISTORY';

export default function FlashcardsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('DECKS');

  // Stores
  const {
    decks,
    flashcards,
    reviewHistory,
    addDeck,
    updateDeck,
    deleteDeck,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
  } = useFlashcardMockStore();

  const { logTopicCompleted } = useProgressMockStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Study Mode State
  const [studyDeck, setStudyDeck] = useState<FlashcardDeck | null>(null);
  const [studyAll, setStudyAll] = useState(false); // Practice all vs due-only
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyComplete, setIsStudyComplete] = useState(false);

  // Dialog states
  const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);

  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // Manage Flashcards Mode within a deck
  const [manageDeck, setManageDeck] = useState<FlashcardDeck | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Flashcards"
          subtitle="Review topics with spaced repetition."
        />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="h-48 border border-border bg-card rounded-2xl animate-pulse" />
          <div className="h-48 border border-border bg-card rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUEUES CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────
  const now = new Date();

  // Due Today: nextReviewDate is in the past/now OR reps === 0 (new)
  const dueTodayCards = flashcards.filter(
    (c) => new Date(c.nextReviewDate) <= now || c.reps === 0
  );

  // Upcoming: nextReviewDate is in the future AND reps > 0
  const upcomingCards = flashcards.filter(
    (c) => new Date(c.nextReviewDate) > now && c.reps > 0
  );

  // Mastered: reps >= 4 OR easeFactor >= 2.5
  const masteredCards = flashcards.filter(
    (c) => c.reps >= 4 || c.easeFactor >= 2.6
  );

  // Learning: reps > 0 && reps < 4
  const learningCards = flashcards.filter((c) => c.reps > 0 && c.reps < 4);

  // New Cards: reps === 0
  const newCards = flashcards.filter((c) => c.reps === 0);

  // Filtered decks list
  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get review cards queue for a deck
  const getDeckCards = (deckId: string) => {
    return flashcards.filter((card) => card.deckId === deckId);
  };

  // Get SM-2 Due/New queue for study session
  const getDeckDueCards = (deckId: string) => {
    return flashcards.filter(
      (c) =>
        c.deckId === deckId &&
        (new Date(c.nextReviewDate) <= now || c.reps === 0)
    );
  };

  // Spaced Repetition metrics
  const getDeckStats = (deckId: string) => {
    const cards = getDeckCards(deckId);
    if (cards.length === 0) return { total: 0, progress: 0, dueCount: 0 };
    const mastered = cards.filter(
      (c) => c.reps >= 4 || c.easeFactor >= 2.6
    ).length;
    const progress = Math.round((mastered / cards.length) * 100);
    const dueCount = cards.filter(
      (c) => new Date(c.nextReviewDate) <= now || c.reps === 0
    ).length;
    return { total: cards.length, progress, dueCount };
  };

  // Global Spaced Repetition stats
  const totalReviewsToday = reviewHistory.filter((rev) => {
    const revDate = new Date(rev.reviewedAt).toDateString();
    return revDate === now.toDateString();
  }).length;

  const goodEasyReviewsStr = reviewHistory.filter(
    (rev) => rev.rating === 'EASY' || rev.rating === 'GOOD'
  ).length;
  const globalAccuracy =
    reviewHistory.length > 0
      ? Math.round((goodEasyReviewsStr / reviewHistory.length) * 100)
      : 0;

  // Deck CRUD handles
  const handleOpenCreateDeck = () => {
    setEditingDeck(null);
    setIsDeckDialogOpen(true);
  };

  const handleOpenEditDeck = (deck: FlashcardDeck, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDeck(deck);
    setIsDeckDialogOpen(true);
  };

  const handleDeckFormSubmit = (data: CreateDeckInput) => {
    if (editingDeck) {
      updateDeck(editingDeck.id, data);
    } else {
      addDeck(data);
    }
    setIsDeckDialogOpen(false);
  };

  const handleConfirmDeleteDeck = () => {
    if (deletingDeckId) {
      deleteDeck(deletingDeckId);
      setDeletingDeckId(null);
      if (studyDeck?.id === deletingDeckId) setStudyDeck(null);
      if (manageDeck?.id === deletingDeckId) setManageDeck(null);
    }
  };

  // Flashcard CRUD handles
  const handleOpenCreateCard = () => {
    setEditingCard(null);
    setIsCardDialogOpen(true);
  };

  const handleOpenEditCard = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setIsCardDialogOpen(true);
  };

  const handleCardFormSubmit = (data: CreateFlashcardInput) => {
    if (editingCard) {
      updateFlashcard(editingCard.id, data);
    } else {
      addFlashcard(data);
    }
    setIsCardDialogOpen(false);
  };

  const handleConfirmDeleteCard = () => {
    if (deletingCardId) {
      deleteFlashcard(deletingCardId);
      setDeletingCardId(null);
    }
  };

  // Study Flow Actions
  const startStudy = (deck: FlashcardDeck, practiceAll = false) => {
    setStudyDeck(deck);
    setStudyAll(practiceAll);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setIsStudyComplete(false);
  };

  const currentStudyCards = studyDeck
    ? studyAll
      ? getDeckCards(studyDeck.id)
      : getDeckDueCards(studyDeck.id)
    : [];

  const currentCard = currentStudyCards[currentCardIdx];

  const handleRecallRating = (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    if (!currentCard) return;

    // Record SM-2 update
    reviewFlashcard(currentCard.id, rating);

    // Occasionally record completed topic in activity logs
    if (rating === 'EASY' || rating === 'GOOD') {
      logTopicCompleted(
        `SM-2 Review [${rating}]: ${currentCard.front.slice(0, 30)}...`
      );
    }

    // Go to next card
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIdx + 1 < currentStudyCards.length) {
        setCurrentCardIdx(currentCardIdx + 1);
      } else {
        setIsStudyComplete(true);
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {studyDeck ? (
        // ─────────────────────────────────────────────────────────────────────────────
        // STUDY MODE PANEL
        // ─────────────────────────────────────────────────────────────────────────────
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStudyDeck(null)}
              className="text-xs gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Exit Study Mode
            </Button>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {studyDeck.name} ({studyAll ? 'Practice All' : 'SM-2 Due Queue'})
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isStudyComplete ? (
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
                    Session Completed!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Excellent work. Next review dates have been scheduled using
                    the SuperMemo-2 Spaced Repetition algorithms.
                  </p>
                </div>
                <Button
                  onClick={() => setStudyDeck(null)}
                  className="bg-purple-600 text-white hover:bg-purple-700 text-xs"
                >
                  Back to Decks
                </Button>
              </motion.div>
            ) : currentStudyCards.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="h-8 w-8" />}
                title="Queue is empty"
                description={
                  studyAll
                    ? 'Add flashcards to this deck to start practicing.'
                    : 'No cards due for review today in this deck! Feel free to practice all cards instead.'
                }
                action={{
                  label: studyAll ? 'Back to Decks' : 'Practice All Cards',
                  onClick: () =>
                    studyAll ? setStudyDeck(null) : startStudy(studyDeck, true),
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                    <span>PROGRESS</span>
                    <span>
                      {currentCardIdx + 1} of {currentStudyCards.length} Cards
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentCardIdx + 1) / currentStudyCards.length) * 100}%`,
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
                          Front / Question
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
                        Click card to reveal answer
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
                          Back / Answer
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

                {/* Rating Action Row */}
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
                        onClick={() => handleRecallRating('AGAIN')}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Again</span>
                        <span className="text-[9px] opacity-75">
                          1d interval
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRecallRating('HARD')}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Hard</span>
                        <span className="text-[9px] opacity-75">Next rep</span>
                      </Button>
                      <Button
                        onClick={() => handleRecallRating('GOOD')}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Good</span>
                        <span className="text-[9px] opacity-75">
                          Normal interval
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRecallRating('EASY')}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-xs h-10 flex flex-col items-center justify-center"
                      >
                        <span className="font-bold">Easy</span>
                        <span className="text-[9px] opacity-75">
                          Bonus interval
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : manageDeck ? (
        // ─────────────────────────────────────────────────────────────────────────────
        // MANAGE CARDS VIEW
        // ─────────────────────────────────────────────────────────────────────────────
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setManageDeck(null)}
              className="text-xs gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Decks
            </Button>
            <Button
              onClick={handleOpenCreateCard}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Flashcard
            </Button>
          </div>

          <PageHeader
            title={`Manage Cards — ${manageDeck.name}`}
            subtitle="Create, edit, and inspect active spacing intervals for flashcards."
          />

          {getDeckCards(manageDeck.id).length === 0 ? (
            <EmptyState
              icon={<Layers className="h-8 w-8" />}
              title="No cards in this deck yet"
              description="Add your first flashcard question and answer pair."
              action={{
                label: 'Create Flashcard',
                onClick: handleOpenCreateCard,
              }}
            />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {getDeckCards(manageDeck.id).map((card) => (
                <Card
                  key={card.id}
                  className="border border-border bg-card flex flex-col justify-between"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">
                            EF: {card.easeFactor.toFixed(1)}
                          </span>
                          <span className="text-[9px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">
                            Interval: {card.interval}d
                          </span>
                          <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase">
                            Reps: {card.reps}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-normal pt-1">
                          {card.front}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleOpenEditCard(card, e)}
                          aria-label="Edit Card"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeletingCardId(card.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Delete Card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 border-t border-border bg-muted/10 rounded-b-xl text-xs text-muted-foreground leading-normal p-4">
                    <p className="font-semibold text-foreground pb-0.5">
                      Answer:
                    </p>
                    <p>{card.back}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ─────────────────────────────────────────────────────────────────────────────
        // MAIN FLASHCARDS VIEW (DECKS + QUEUES + STATS)
        // ─────────────────────────────────────────────────────────────────────────────
        <div className="space-y-6">
          <PageHeader
            title="Spaced Repetition Flashcards"
            subtitle="Practice active recall using the optimized SuperMemo-2 Spaced Repetition scheduler."
            actions={
              <Button
                onClick={handleOpenCreateDeck}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Deck
              </Button>
            }
          />

          {/* Quick Metrics */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard
              title="Due Today"
              value={`${dueTodayCards.length} cards`}
              subtitle="Pending review sessions"
              icon={<Clock className="h-4 w-4" />}
              accent="bg-rose-600/10 text-rose-600 dark:text-rose-400"
            />
            <StatCard
              title="Mastered Cards"
              value={`${masteredCards.length}`}
              subtitle="EF ≥ 2.6 or reps ≥ 4"
              icon={<Award className="h-4 w-4" />}
              accent="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              title="Today's Reviews"
              value={`${totalReviewsToday}`}
              subtitle="Reviews completed today"
              icon={<Calendar className="h-4 w-4" />}
              accent="bg-blue-600/10 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Recall Accuracy"
              value={`${globalAccuracy}%`}
              subtitle="Good or Easy recall ratings"
              icon={<TrendingUp className="h-4 w-4" />}
              accent="bg-purple-600/10 text-purple-600 dark:text-purple-400"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border gap-4 text-xs font-semibold select-none">
            <button
              onClick={() => setActiveTab('DECKS')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'DECKS'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Study Decks
            </button>
            <button
              onClick={() => setActiveTab('QUEUES')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'QUEUES'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              SM-2 Schedule Queues ({dueTodayCards.length} Due)
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'HISTORY'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Review History ({reviewHistory.length})
            </button>
          </div>

          {activeTab === 'DECKS' && (
            // DECKS VIEW
            <div className="space-y-6">
              {/* Search Row */}
              {decks.length > 0 && (
                <div className="max-w-xs relative">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search decks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              )}

              {filteredDecks.length === 0 ? (
                <EmptyState
                  icon={<Layers className="h-8 w-8" />}
                  title={
                    searchQuery ? 'No decks found' : 'No flashcard decks yet'
                  }
                  description={
                    searchQuery
                      ? 'Try refining your search keyword.'
                      : 'Create a flashcard deck (e.g. Operating Systems, System Design) to study with Spaced Repetition.'
                  }
                  {...(!searchQuery
                    ? {
                        action: {
                          label: 'New Deck',
                          onClick: handleOpenCreateDeck,
                        },
                      }
                    : {})}
                />
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {filteredDecks.map((deck) => {
                    const { total, progress, dueCount } = getDeckStats(deck.id);
                    return (
                      <Card
                        key={deck.id}
                        onClick={() => startStudy(deck, false)}
                        className="group border border-border bg-card hover:bg-muted/10 cursor-pointer transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="font-bold text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {deck.name}
                              </h3>
                              {deck.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {deck.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => handleOpenEditDeck(deck, e)}
                                aria-label="Edit Deck"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingDeckId(deck.id);
                                }}
                                className="text-destructive hover:text-destructive"
                                aria-label="Delete Deck"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="py-2 space-y-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {dueCount > 0 ? (
                              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                                <Clock className="h-3.5 w-3.5" /> {dueCount} due
                                reviews
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <CheckCircle className="h-3.5 w-3.5" /> Fully
                                completed today
                              </span>
                            )}
                            <span>{progress}% mastery</span>
                          </div>

                          {/* Mastery Progress Bar */}
                          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </CardContent>

                        <CardFooter className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10 rounded-b-xl px-4 py-2">
                          <span>{total} cards total</span>
                          <div className="flex gap-2.5">
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-7 text-xs text-purple-600 dark:text-purple-400 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setManageDeck(deck);
                              }}
                            >
                              Manage Cards
                            </Button>
                            {dueCount > 0 ? (
                              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                                Study Due <ArrowRight className="h-3 w-3" />
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="xs"
                                className="h-7 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-transparent p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startStudy(deck, true);
                                }}
                              >
                                Practice All
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'QUEUES' && (
            // QUEUE MANAGER VIEW
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Due Today Queue */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Due Today (
                    {dueTodayCards.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {dueTodayCards.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">
                      No cards due for review today.
                    </p>
                  ) : (
                    dueTodayCards.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 border border-border bg-card rounded-lg space-y-1"
                      >
                        <p className="text-xs font-bold truncate">{c.front}</p>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>EF: {c.easeFactor.toFixed(1)}</span>
                          <span>Interval: {c.interval}d</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Queue */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                  <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Upcoming Reviews (
                    {upcomingCards.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {upcomingCards.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">
                      No upcoming reviews scheduled.
                    </p>
                  ) : (
                    upcomingCards.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 border border-border bg-card rounded-lg space-y-1"
                      >
                        <p className="text-xs font-bold truncate">{c.front}</p>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>
                            Next review:{' '}
                            {new Date(c.nextReviewDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-purple-500/10 p-2.5 rounded-lg border border-purple-500/20">
                  <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Layers3 className="h-4 w-4" /> Spacing Cohorts
                  </h4>
                </div>
                <div className="p-4 border border-border bg-card rounded-lg space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Mastered Cards (Reps ≥ 4):</span>
                    <span className="font-bold text-emerald-500">
                      {masteredCards.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Learning Cards:</span>
                    <span className="font-bold text-blue-500">
                      {learningCards.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unreviewed / New Cards:</span>
                    <span className="font-bold text-zinc-500">
                      {newCards.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HISTORY' && (
            // REVIEW HISTORY TIMELINE
            <div className="space-y-4 max-w-xl mx-auto">
              <h4 className="text-xs font-bold text-foreground">
                Timeline of Spaced Repetition Responses
              </h4>
              {reviewHistory.length === 0 ? (
                <EmptyState
                  icon={<HelpCircle className="h-8 w-8" />}
                  title="No review logs yet"
                  description="Complete a flashcard study session to populate recall logs."
                />
              ) : (
                <div className="border-l border-border pl-4 space-y-4">
                  {reviewHistory.map((rev) => {
                    const card = flashcards.find((c) => c.id === rev.cardId);
                    return (
                      <div key={rev.id} className="relative space-y-1">
                        <span className="absolute -left-[21px] top-1 flex h-2 w-2 rounded-full bg-purple-600" />
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground truncate max-w-[280px]">
                            {card ? card.front : 'Deleted Flashcard'}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              rev.rating === 'EASY'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : rev.rating === 'GOOD'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : rev.rating === 'HARD'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {rev.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Reviewed{' '}
                          {new Date(rev.reviewedAt).toLocaleTimeString()} —
                          scheduled interval: {rev.interval}d (EF:{' '}
                          {rev.easeFactor.toFixed(1)})
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT DECK DIALOG */}
      <Dialog open={isDeckDialogOpen} onOpenChange={setIsDeckDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDeck ? 'Edit Deck' : 'Create Deck'}
            </DialogTitle>
          </DialogHeader>
          <DeckForm
            {...(editingDeck ? { initialValues: editingDeck } : {})}
            onSubmit={handleDeckFormSubmit}
            onCancel={() => setIsDeckDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CREATE/EDIT FLASHCARD DIALOG */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit Flashcard' : 'Add Flashcard'}
            </DialogTitle>
          </DialogHeader>
          <FlashcardForm
            decks={decks}
            {...(manageDeck?.id ? { defaultDeckId: manageDeck.id } : {})}
            {...(editingCard ? { initialValues: editingCard } : {})}
            onSubmit={handleCardFormSubmit}
            onCancel={() => setIsCardDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DECK */}
      <ConfirmDialog
        isOpen={deletingDeckId !== null}
        onClose={() => setDeletingDeckId(null)}
        title="Delete Flashcard Deck?"
        description="This will permanently delete this deck and all of its associated flashcards. This action cannot be undone."
        onConfirm={handleConfirmDeleteDeck}
      />

      {/* CONFIRM DELETE CARD */}
      <ConfirmDialog
        isOpen={deletingCardId !== null}
        onClose={() => setDeletingCardId(null)}
        title="Delete Flashcard?"
        description="Are you sure you want to permanently delete this flashcard?"
        onConfirm={handleConfirmDeleteCard}
      />
    </div>
  );
}
