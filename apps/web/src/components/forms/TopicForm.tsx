'use client';

import React, { useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTopicSchema,
  CreateTopicInput,
  DIFFICULTY,
  TOPIC_STATUS,
} from '@aelpt/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface TopicFormProps {
  initialValues?: Partial<CreateTopicInput>;
  onSubmit: (data: CreateTopicInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TopicForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TopicFormProps) {
  const [tagInput, setTagInput] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTopicInput>({
    resolver: zodResolver(
      createTopicSchema
    ) as unknown as Resolver<CreateTopicInput>,
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      difficulty: initialValues?.difficulty ?? 'MEDIUM',
      status: initialValues?.status ?? 'NOT_STARTED',
      estimatedMinutes: initialValues?.estimatedMinutes ?? 0,
      tags: initialValues?.tags ?? [],
    },
  });

  const tags = watch('tags') || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleaned = tagInput.trim();
      if (cleaned && !tags.includes(cleaned)) {
        setValue('tags', [...tags, cleaned], { shouldValidate: true });
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setValue(
      'tags',
      tags.filter((_: string, idx: number) => idx !== indexToRemove),
      { shouldValidate: true }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Topic Title</Label>
        <Input
          id="title"
          placeholder="e.g., Quick Sort Optimizations"
          {...register('title')}
        />
        {errors.title?.message && (
          <p className="text-xs text-destructive">
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            {...register('difficulty')}
          >
            {Object.keys(DIFFICULTY).map((key) => (
              <option key={key} value={key}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.difficulty?.message && (
            <p className="text-xs text-destructive">
              {errors.difficulty.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            {...register('status')}
          >
            {Object.keys(TOPIC_STATUS).map((key) => (
              <option key={key} value={key}>
                {key
                  .replace('_', ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          {errors.status?.message && (
            <p className="text-xs text-destructive">
              {errors.status.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="estimatedMinutes">Estimated Minutes</Label>
        <Input
          id="estimatedMinutes"
          type="number"
          min={0}
          placeholder="e.g., 90"
          {...register('estimatedMinutes', { valueAsNumber: true })}
        />
        {errors.estimatedMinutes?.message && (
          <p className="text-xs text-destructive">
            {errors.estimatedMinutes.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags-input"
          placeholder="Press Enter to add tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag: string, idx: number) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-purple-600/10 px-2 py-0.5 text-xs text-purple-600 dark:text-purple-400"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="rounded-full hover:bg-purple-600/25 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional notes, concepts, or subtopics to cover..."
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="text-xs text-destructive">
            {errors.description.message as string}
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
          {isSubmitting ? 'Saving...' : 'Save Topic'}
        </Button>
      </div>
    </form>
  );
}
