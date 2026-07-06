'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Unit, CreateUnitInput } from '@aelpt/shared';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
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
import { UnitForm } from '@/components/forms/UnitForm';
import { ROUTES } from '@/lib/constants/routes';

interface SubjectDetailPageProps {
  params: Promise<{ semesterId: string; subjectId: string }>;
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const router = useRouter();
  const { semesterId, subjectId } = use(params);

  const {
    semesters,
    subjects,
    units,
    topics,
    addUnit,
    updateUnit,
    deleteUnit,
  } = useAcademicMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const semester = semesters.find((s) => s.id === semesterId);
  const subject = subjects.find(
    (s) => s.id === subjectId && s.semesterId === semesterId
  );

  if (!semester || !subject) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="Subject not found"
        description="The subject you are looking for does not exist or has been deleted."
        action={{
          label: 'Back to Semesters',
          onClick: () => router.push(ROUTES.SEMESTERS),
        }}
      />
    );
  }

  // Get units under this subject
  const subjectUnits = units.filter((u) => u.subjectId === subjectId);

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (unit: Unit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleFormSubmit = (data: CreateUnitInput) => {
    const { description, ...rest } = data;
    const submitData = {
      ...rest,
      ...(description ? { description } : {}),
    };
    if (editingUnit) {
      updateUnit(editingUnit.id, submitData);
    } else {
      addUnit(subjectId, submitData);
    }
    setIsFormOpen(false);
    setEditingUnit(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteUnit(deletingId);
      setDeletingId(null);
    }
  };

  // Filter units
  const filteredUnits = subjectUnits.filter((unit) =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb Back link */}
      <div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => router.push(ROUTES.SEMESTER_DETAIL(semesterId))}
          className="text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to {semester.name}
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={
          subject.code ? `${subject.code} — ${subject.name}` : subject.name
        }
        subtitle={subject.description || 'Subject units review'}
        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Unit
          </Button>
        }
      />

      {/* Search Input */}
      {subjectUnits.length > 0 && (
        <div className="max-w-xs">
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}

      {/* Grid of units */}
      {filteredUnits.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={searchQuery ? 'No results found' : 'No units yet'}
          description={
            searchQuery
              ? 'Try refining your search keyword.'
              : 'Add study units (e.g., Divide & Conquer, Relational Algebra) to categorize study topics.'
          }
          {...(!searchQuery
            ? { action: { label: 'Add Unit', onClick: handleOpenCreate } }
            : {})}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => {
            const unitTopics = topics.filter((t) => t.unitId === unit.id);

            return (
              <Card
                key={unit.id}
                onClick={() =>
                  router.push(
                    `${ROUTES.SEMESTER_DETAIL(semesterId)}/subjects/${subjectId}/units/${unit.id}`
                  )
                }
                className="group border border-border bg-card hover:bg-muted/10 cursor-pointer transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {unit.name}
                    </h3>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => handleOpenEdit(unit, e)}
                        aria-label="Edit Unit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => handleOpenDelete(unit.id, e)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete Unit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2 space-y-3">
                  {unit.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {unit.description}
                    </p>
                  )}

                  {/* Estimation */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Estimated: {unit.estimatedHours} hours</span>
                  </div>

                  {/* Completion progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>Completion</span>
                      <span>{unit.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${unit.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10 rounded-b-xl px-4 py-2">
                  <span>{unitTopics.length} learning topics</span>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Enter <ArrowRight className="h-3 w-3" />
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
          </DialogHeader>
          <UnitForm
            {...(editingUnit
              ? {
                  initialValues: {
                    name: editingUnit.name,
                    estimatedHours: editingUnit.estimatedHours,
                    description: editingUnit.description,
                  },
                }
              : {})}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Unit?"
        description="This will permanently delete this course unit and all topics nested under it. This action cannot be undone."
        variant="danger"
        confirmLabel="Delete Unit"
      />
    </div>
  );
}
