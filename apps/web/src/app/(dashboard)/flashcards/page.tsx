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
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/common';
import { DeckForm } from '@/components/forms/DeckForm';
import { FlashcardForm } from '@/components/forms/FlashcardForm';
import {
  CreateDeckInput,
  CreateFlashcardInput,
  FlashcardDeck,
  Flashcard,
} from '@aelpt/shared';

export default function FlashcardsPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Stores
  const {
    decks,
    flashcards,
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

  // Filtered decks list
  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get review cards queue for a deck
  const getDeckCards = (deckId: string) => {
    return flashcards.filter((card) => card.deckId === deckId);
  };

  // Leitner metrics per deck
  const getDeckStats = (deckId: string) => {
    const cards = getDeckCards(deckId);
    if (cards.length === 0) return { total: 0, progress: 0, avgBox: 1 };
    const learned = cards.filter((c) => c.box > 1).length;
    const progress = Math.round((learned / cards.length) * 100);
    const avgBox =
      Math.round(
        (cards.reduce((acc, curr) => acc + curr.box, 0) / cards.length) * 10
      ) / 10;
    return { total: cards.length, progress, avgBox };
  };

  // Handle deck forms
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

  // Handle flashcard forms
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
  const startStudy = (deck: FlashcardDeck) => {
    setStudyDeck(deck);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setIsStudyComplete(false);
  };

  const currentStudyCards = studyDeck ? getDeckCards(studyDeck.id) : [];
  const currentCard = currentStudyCards[currentCardIdx];

  const handleRecallRating = (rating: 'EASY' | 'MEDIUM' | 'HARD') => {
    if (!currentCard) return;

    // Record review update
    reviewFlashcard(currentCard.id, rating);

    // If rated EASY, trigger progress log occasionally
    if (rating === 'EASY') {
      logTopicCompleted(
        `Flashcard Recall: ${currentCard.front.slice(0, 30)}...`
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
      {/* Dynamic Navigation */}
      {studyDeck ? (
        // STUDY MODE PANEL
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
              {studyDeck.name}
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
                    Excellent work reviewing this deck. Spaced repetition dates
                    have been updated.
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
                title="Deck is empty"
                description="Please add cards to this deck inside the card manager."
                action={{
                  label: 'Back to Decks',
                  onClick: () => setStudyDeck(null),
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
                          Question / Front
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <RotateCw className="h-3.5 w-3.5 animate-pulse" />{' '}
                          Flip Card
                        </span>
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
                          Answer / Back
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
                    <>
                      <Button
                        onClick={() => handleRecallRating('HARD')}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs h-10"
                      >
                        🔴 Hard (Again)
                      </Button>
                      <Button
                        onClick={() => handleRecallRating('MEDIUM')}
                        className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs h-10"
                      >
                        🟡 Medium (Soon)
                      </Button>
                      <Button
                        onClick={() => handleRecallRating('EASY')}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-xs h-10"
                      >
                        🟢 Easy (Got it!)
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : manageDeck ? (
        // MANAGE CARDS VIEW
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
            subtitle="Create, edit, and review individual flashcards inside this deck."
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
                      <div className="space-y-1">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground uppercase">
                          Box {card.box}
                        </span>
                        <p className="text-sm font-semibold text-foreground leading-normal pt-1.5">
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
                    <p className="font-medium text-foreground pb-0.5">
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
        // DECKS OVERVIEW GRID LIST
        <div className="space-y-6">
          <PageHeader
            title="Flashcard Decks"
            subtitle="Spaced repetition recall system for syllabus review."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenCreateDeck}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Deck
                </Button>
              </div>
            }
          />

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
              title={searchQuery ? 'No decks found' : 'No flashcard decks yet'}
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
                const { total, progress, avgBox } = getDeckStats(deck.id);
                return (
                  <Card
                    key={deck.id}
                    onClick={() => startStudy(deck)}
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
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Box Average:{' '}
                          {avgBox} / 5
                        </span>
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
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          Study <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
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
