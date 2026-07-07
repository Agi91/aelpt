'use client';

import React, { useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createNoteSchema,
  CreateNoteInput,
  Subject,
  Topic,
} from '@aelpt/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NoteFormProps {
  subjects: Subject[];
  topics: Topic[];
  initialValues?: Partial<CreateNoteInput>;
  onSubmit: (data: CreateNoteInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function NoteForm({
  subjects,
  topics,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: NoteFormProps) {
  const [editorTab, setEditorTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(
      createNoteSchema
    ) as unknown as Resolver<CreateNoteInput>,
    defaultValues: {
      title: initialValues?.title ?? '',
      content: initialValues?.content ?? '',
      subjectId: initialValues?.subjectId ?? '',
      topicId: initialValues?.topicId ?? '',
      isPinned: initialValues?.isPinned ?? false,
      isFavorite: initialValues?.isFavorite ?? false,
    },
  });

  const contentValue = watch('content') || '';

  // Minimal Markdown helper for HTML preview
  const parseMarkdownToHtml = (text: string) => {
    if (!text)
      return '<p class="text-zinc-500 italic">No content written yet.</p>';
    return text
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return `<h3 class="text-base font-bold text-foreground mt-3 mb-1.5">${trimmed.slice(3)}</h3>`;
        }
        if (trimmed.startsWith('# ')) {
          return `<h2 class="text-lg font-extrabold text-foreground mt-4 mb-2 border-b border-border pb-1">${trimmed.slice(2)}</h2>`;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return `<li class="ml-4 list-disc text-muted-foreground my-0.5">${trimmed.slice(2)}</li>`;
        }
        if (trimmed.startsWith('1. ')) {
          return `<li class="ml-4 list-decimal text-muted-foreground my-0.5">${trimmed.slice(3)}</li>`;
        }
        if (trimmed === '') return '<div class="h-2"></div>';

        // Bold tags replacement (**text** -> <strong>text</strong>)
        const boldParsed = trimmed.replace(
          /\*\*(.*?)\*\*/g,
          '<strong>$1</strong>'
        );
        return `<p class="text-muted-foreground leading-normal my-1">${boldParsed}</p>`;
      })
      .join('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Note Title</Label>
        <Input
          id="title"
          placeholder="e.g., Virtual Memory & Paging Mechanisms"
          {...register('title')}
        />
        {errors.title?.message && (
          <p className="text-xs text-destructive">
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
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
      </div>

      {/* Rich/Markdown Editor Section */}
      <div className="space-y-2 border border-border rounded-lg overflow-hidden">
        <div className="flex border-b border-border bg-muted/40 text-xs select-none">
          <button
            type="button"
            onClick={() => setEditorTab('EDIT')}
            className={`px-4 py-2 font-semibold border-r border-border transition-colors ${
              editorTab === 'EDIT'
                ? 'bg-card text-purple-600 dark:text-purple-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('PREVIEW')}
            className={`px-4 py-2 font-semibold transition-colors ${
              editorTab === 'PREVIEW'
                ? 'bg-card text-purple-600 dark:text-purple-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="p-1">
          {editorTab === 'EDIT' ? (
            <textarea
              id="content"
              rows={8}
              placeholder="Write note contents... Markdown elements like # Header, - Bullets, and **Bold** are supported."
              className="flex min-h-[200px] w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-0 placeholder:text-muted-foreground"
              {...register('content')}
            />
          ) : (
            <div
              className="p-3 text-sm min-h-[200px] max-h-[300px] overflow-y-auto bg-card rounded-md font-sans"
              dangerouslySetInnerHTML={{
                __html: parseMarkdownToHtml(contentValue),
              }}
            />
          )}
        </div>
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
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </form>
  );
}
