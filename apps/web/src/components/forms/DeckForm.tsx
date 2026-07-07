'use client';

import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDeckSchema, CreateDeckInput } from '@aelpt/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeckFormProps {
  initialValues?: Partial<CreateDeckInput>;
  onSubmit: (data: CreateDeckInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DeckForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DeckFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDeckInput>({
    resolver: zodResolver(
      createDeckSchema
    ) as unknown as Resolver<CreateDeckInput>,
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      subjectId: initialValues?.subjectId ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Deck Name</Label>
        <Input
          id="name"
          placeholder="e.g., Computer Networks - TCP/IP"
          {...register('name')}
        />
        {errors.name?.message && (
          <p className="text-xs text-destructive">
            {errors.name.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="e.g., OSI model layer details, protocol formats, subnet calculations..."
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
          {isSubmitting ? 'Saving...' : 'Save Deck'}
        </Button>
      </div>
    </form>
  );
}
