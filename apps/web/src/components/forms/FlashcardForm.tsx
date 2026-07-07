'use client';

import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFlashcardSchema,
  CreateFlashcardInput,
  FlashcardDeck,
} from '@aelpt/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FlashcardFormProps {
  decks: FlashcardDeck[];
  initialValues?: Partial<CreateFlashcardInput>;
  defaultDeckId?: string;
  onSubmit: (data: CreateFlashcardInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FlashcardForm({
  decks,
  initialValues,
  defaultDeckId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FlashcardFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFlashcardInput>({
    resolver: zodResolver(
      createFlashcardSchema
    ) as unknown as Resolver<CreateFlashcardInput>,
    defaultValues: {
      deckId: initialValues?.deckId ?? defaultDeckId ?? '',
      front: initialValues?.front ?? '',
      back: initialValues?.back ?? '',
      difficulty: initialValues?.difficulty ?? 'MEDIUM',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="deckId">Select Deck</Label>
        <select
          id="deckId"
          className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
          {...register('deckId')}
        >
          <option value="" disabled>
            Choose a deck...
          </option>
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.deckId?.message && (
          <p className="text-xs text-destructive">
            {errors.deckId.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="front">Front (Question / Concept)</Label>
        <textarea
          id="front"
          rows={3}
          placeholder="e.g., What is the worst-case time complexity of Quick Sort?"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('front')}
        />
        {errors.front?.message && (
          <p className="text-xs text-destructive">
            {errors.front.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="back">Back (Answer / Explanation)</Label>
        <textarea
          id="back"
          rows={4}
          placeholder="e.g., O(n^2) when partitioning splits are highly unbalanced."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('back')}
        />
        {errors.back?.message && (
          <p className="text-xs text-destructive">
            {errors.back.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="difficulty">Initial Difficulty</Label>
        <select
          id="difficulty"
          className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
          {...register('difficulty')}
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        {errors.difficulty?.message && (
          <p className="text-xs text-destructive">
            {errors.difficulty.message as string}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Card'}
        </Button>
      </div>
    </form>
  );
}
