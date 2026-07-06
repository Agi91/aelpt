'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BookOpen,
  Calendar,
  Trash2,
  Edit2,
  ArrowRight,
} from 'lucide-react';
import { Semester, CreateSemesterInput } from '@aelpt/shared';
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
import { SemesterForm } from '@/components/forms/SemesterForm';
import { ROUTES } from '@/lib/constants/routes';

export default function SemestersPage() {
  const router = useRouter();
  const { semesters, subjects, addSemester, updateSemester, deleteSemester } =
    useAcademicMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('NEWEST');

  const handleOpenCreate = () => {
    setEditingSemester(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sem: Semester, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSemester(sem);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleFormSubmit = (data: CreateSemesterInput) => {
    const { description, ...rest } = data;
    const submitData = {
      ...rest,
      ...(description ? { description } : {}),
    };
    if (editingSemester) {
      updateSemester(editingSemester.id, submitData);
    } else {
      addSemester(submitData);
    }
    setIsFormOpen(false);
    setEditingSemester(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteSemester(deletingId);
      setDeletingId(null);
    }
  };

  // Filter and sort semesters
  const filteredSemesters = semesters
    .filter((sem) => sem.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
      if (sortBy === 'OLDEST')
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      // NEWEST
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <PageHeader
        title="Semesters"
        subtitle="Manage your academic semesters and keep track of subject syllabus content."
        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Semester
          </Button>
        }
      />

      {/* Search Input */}
      {semesters.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search semesters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="NAME_ASC">Name (A-Z)</option>
            <option value="NAME_DESC">Name (Z-A)</option>
          </select>
        </div>
      )}

      {/* Grid of semesters */}
      {filteredSemesters.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={searchQuery ? 'No results found' : 'No semesters yet'}
          description={
            searchQuery
              ? 'Try refining your search text.'
              : 'Add your first semester to begin mapping subjects, units, and learning topics.'
          }
          {...(!searchQuery
            ? { action: { label: 'Add Semester', onClick: handleOpenCreate } }
            : {})}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSemesters.map((sem) => {
            const semSubjects = subjects.filter((s) => s.semesterId === sem.id);
            const formatDate = (dStr: string) =>
              new Date(dStr).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              });

            return (
              <Card
                key={sem.id}
                onClick={() => router.push(ROUTES.SEMESTER_DETAIL(sem.id))}
                className="group border border-border bg-card hover:bg-muted/10 cursor-pointer transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {sem.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDate(sem.startDate)} -{' '}
                          {formatDate(sem.endDate)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => handleOpenEdit(sem, e)}
                        aria-label="Edit Semester"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => handleOpenDelete(sem.id, e)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete Semester"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2">
                  {sem.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {sem.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic">
                      No description provided.
                    </p>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10 rounded-b-xl px-4 py-2">
                  <span>{semSubjects.length} active subjects</span>
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
            <DialogTitle>
              {editingSemester ? 'Edit Semester' : 'Add Semester'}
            </DialogTitle>
          </DialogHeader>
          <SemesterForm
            {...(editingSemester
              ? {
                  initialValues: {
                    name: editingSemester.name,
                    startDate: editingSemester.startDate,
                    endDate: editingSemester.endDate,
                    description: editingSemester.description,
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
        title="Delete Semester?"
        description="This will permanently delete this semester and all subjects, units, and topics nested under it. This action is irreversible."
        variant="danger"
        confirmLabel="Delete Everything"
      />
    </div>
  );
}
