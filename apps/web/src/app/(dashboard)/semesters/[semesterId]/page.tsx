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
  GripVertical,
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Subject, CreateSubjectInput } from '@aelpt/shared';
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
import { SubjectForm } from '@/components/forms/SubjectForm';
import { DualProgressBar } from '@/components/progress/DualProgressBar';
import { ROUTES } from '@/lib/constants/routes';

interface SemesterDetailPageProps {
  params: Promise<{ semesterId: string }>;
}

export default function SemesterDetailPage({
  params,
}: SemesterDetailPageProps) {
  const router = useRouter();
  const { semesterId } = use(params);

  const {
    semesters,
    subjects,
    units,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    reorderSubjects,
  } = useAcademicMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Find semester
  const semester = semesters.find((s) => s.id === semesterId);
  if (!semester) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="Semester not found"
        description="The semester you are looking for does not exist or has been deleted."
        action={{
          label: 'Back to Semesters',
          onClick: () => router.push(ROUTES.SEMESTERS),
        }}
      />
    );
  }

  // Get subjects under this semester
  const semesterSubjects = subjects.filter((s) => s.semesterId === semesterId);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sub: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(sub);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleFormSubmit = (data: CreateSubjectInput) => {
    const { code, description, ...rest } = data;
    const submitData = {
      ...rest,
      ...(code ? { code } : {}),
      ...(description ? { description } : {}),
    };
    if (editingSubject) {
      updateSubject(editingSubject.id, submitData);
    } else {
      addSubject(semesterId, submitData);
    }
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteSubject(deletingId);
      setDeletingId(null);
    }
  };

  // Filter subjects
  const filteredSubjects = semesterSubjects.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb Back link */}
      <div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => router.push(ROUTES.SEMESTERS)}
          className="text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Semesters
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={semester.name}
        subtitle={semester.description || 'Academic target review'}
        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subject
          </Button>
        }
      />

      {/* Search Input */}
      {semesterSubjects.length > 0 && (
        <div className="max-w-xs">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}

      {/* Grid of subjects */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={searchQuery ? 'No results found' : 'No subjects yet'}
          description={
            searchQuery
              ? 'Try refining your search keyword.'
              : 'Add subjects (e.g., Operating Systems, Data Structures) to begin mapping out course units.'
          }
          {...(!searchQuery
            ? { action: { label: 'Add Subject', onClick: handleOpenCreate } }
            : {})}
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={filteredSubjects}
          onReorder={(newOrder) => reorderSubjects(semesterId, newOrder)}
          className="grid gap-4 grid-cols-1 md:grid-cols-2"
        >
          {filteredSubjects.map((sub) => {
            const subjectUnits = units.filter((u) => u.subjectId === sub.id);
            const unitIds = subjectUnits.map((u) => u.id);
            const subjectTopics = topics.filter((t) =>
              unitIds.includes(t.unitId)
            );

            // Calculate aggregate understanding score
            const completedTopics = subjectTopics.filter(
              (t) => t.status === 'COMPLETED'
            );
            const totalScore = completedTopics.reduce(
              (acc, curr) => acc + curr.understandingScore,
              0
            );
            const avgUnderstanding =
              completedTopics.length > 0
                ? Math.round(totalScore / completedTopics.length)
                : 0;

            return (
              <Reorder.Item
                value={sub}
                key={sub.id}
                as="div"
                className="focus-visible:outline-hidden"
              >
                <Card
                  onClick={() =>
                    router.push(
                      `${ROUTES.SEMESTER_DETAIL(semesterId)}/subjects/${sub.id}`
                    )
                  }
                  className="group border border-border bg-card hover:bg-muted/10 cursor-pointer transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs h-full"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2 min-w-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-1 cursor-grab active:cursor-grabbing shrink-0" />
                        <div>
                          {sub.code && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                              {sub.code}
                            </span>
                          )}
                          <h3 className="font-bold text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-1.5 truncate">
                            {sub.name}
                          </h3>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleOpenEdit(sub, e)}
                          aria-label="Edit Subject"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleOpenDelete(sub.id, e)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Delete Subject"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="py-3">
                    {sub.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {sub.description}
                      </p>
                    )}

                    {/* Syllabus progress & understanding gap using signature DualProgressBar */}
                    <DualProgressBar
                      completion={sub.progress}
                      understanding={avgUnderstanding}
                    />
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10 rounded-b-xl px-4 py-2">
                    <span>
                      {subjectUnits.length} units • {subjectTopics.length}{' '}
                      topics
                    </span>
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Enter <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardFooter>
                </Card>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </DialogTitle>
          </DialogHeader>
          <SubjectForm
            {...(editingSubject
              ? {
                  initialValues: {
                    name: editingSubject.name,
                    code: editingSubject.code,
                    description: editingSubject.description,
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
        title="Delete Subject?"
        description="This will permanently delete this subject and all course units and topics nested under it. This action cannot be undone."
        variant="danger"
        confirmLabel="Delete Subject"
      />
    </div>
  );
}
