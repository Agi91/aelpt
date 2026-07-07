'use client';

import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createResourceSchema,
  CreateResourceInput,
  Subject,
  Topic,
} from '@aelpt/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResourceFormProps {
  subjects: Subject[];
  topics: Topic[];
  initialValues?: Partial<CreateResourceInput>;
  onSubmit: (data: CreateResourceInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ResourceForm({
  subjects,
  topics,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ResourceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateResourceInput>({
    resolver: zodResolver(
      createResourceSchema
    ) as unknown as Resolver<CreateResourceInput>,
    defaultValues: {
      title: initialValues?.title ?? '',
      url: initialValues?.url ?? '',
      description: initialValues?.description ?? '',
      category: initialValues?.category ?? 'WEBSITE',
      subjectId: initialValues?.subjectId ?? '',
      topicId: initialValues?.topicId ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Resource Title</Label>
        <Input
          id="title"
          placeholder="e.g., MIT 6.006 Lecture Notes - Dynamic Programming"
          {...register('title')}
        />
        {errors.title?.message && (
          <p className="text-xs text-destructive">
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="url">URL Link (Optional)</Label>
        <Input
          id="url"
          placeholder="e.g., https://ocw.mit.edu/courses/..."
          {...register('url')}
        />
        {errors.url?.message && (
          <p className="text-xs text-destructive">
            {errors.url.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            {...register('category')}
          >
            <option value="WEBSITE">Website</option>
            <option value="BOOK">Book</option>
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.category?.message && (
            <p className="text-xs text-destructive">
              {errors.category.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="subjectId">Link Subject</Label>
          <select
            id="subjectId"
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            {...register('subjectId')}
          >
            <option value="">No Subject Connection</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="topicId">Link Topic</Label>
        <select
          id="topicId"
          className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
          {...register('topicId')}
        >
          <option value="">No Topic Connection</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Enter resource synopsis, book chapters, or references..."
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
          {isSubmitting ? 'Saving...' : 'Save Resource'}
        </Button>
      </div>
    </form>
  );
}
