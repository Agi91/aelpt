'use client';

import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUnitSchema, CreateUnitInput } from '@aelpt/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UnitFormProps {
  initialValues?: Partial<CreateUnitInput>;
  onSubmit: (data: CreateUnitInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UnitForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UnitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUnitInput>({
    resolver: zodResolver(
      createUnitSchema
    ) as unknown as Resolver<CreateUnitInput>,
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      estimatedHours: initialValues?.estimatedHours ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Unit Name</Label>
        <Input
          id="name"
          placeholder="e.g., Divide & Conquer Algorithms"
          {...register('name')}
        />
        {errors.name?.message && (
          <p className="text-xs text-destructive">
            {errors.name.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="estimatedHours">Estimated Study Hours</Label>
        <Input
          id="estimatedHours"
          type="number"
          min={0}
          placeholder="e.g., 10"
          {...register('estimatedHours', { valueAsNumber: true })}
        />
        {errors.estimatedHours?.message && (
          <p className="text-xs text-destructive">
            {errors.estimatedHours.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional notes or outline of topics in this unit..."
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
          {isSubmitting ? 'Saving...' : 'Save Unit'}
        </Button>
      </div>
    </form>
  );
}
