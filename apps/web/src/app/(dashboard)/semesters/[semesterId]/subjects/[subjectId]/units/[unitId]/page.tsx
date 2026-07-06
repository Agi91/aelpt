'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Topic, CreateTopicInput } from '@aelpt/shared';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/common';
import { TopicForm } from '@/components/forms/TopicForm';
import { TopicProgressCard } from '@/components/progress/TopicProgressCard';
import { ROUTES } from '@/lib/constants/routes';

interface UnitDetailPageProps {
  params: Promise<{ semesterId: string; subjectId: string; unitId: string }>;
}

export default function UnitDetailPage({ params }: UnitDetailPageProps) {
  const router = useRouter();
  const { semesterId, subjectId, unitId } = use(params);

  const {
    semesters,
    subjects,
    units,
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
  } = useAcademicMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const semester = semesters.find((s) => s.id === semesterId);
  const subject = subjects.find(
    (s) => s.id === subjectId && s.semesterId === semesterId
  );
  const unit = units.find((u) => u.id === unitId && u.subjectId === subjectId);

  if (!semester || !subject || !unit) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="Unit not found"
        description="The course unit you are looking for does not exist or has been deleted."
        action={{
          label: 'Back to Semesters',
          onClick: () => router.push(ROUTES.SEMESTERS),
        }}
      />
    );
  }

  // Get topics under this unit
  const unitTopics = topics.filter((t) => t.unitId === unitId);

  const handleOpenCreate = () => {
    setEditingTopic(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleFormSubmit = (data: CreateTopicInput) => {
    const { description, estimatedMinutes, tags, ...rest } = data;
    const submitData = {
      ...rest,
      ...(description ? { description } : {}),
      estimatedMinutes: estimatedMinutes ?? 0,
      tags: tags ?? [],
      understandingScore: editingTopic ? editingTopic.understandingScore : 0,
    };
    if (editingTopic) {
      updateTopic(editingTopic.id, submitData);
    } else {
      addTopic(unitId, submitData);
    }
    setIsFormOpen(false);
    setEditingTopic(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTopic(deletingId);
      setDeletingId(null);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    router.push(
      `${ROUTES.SEMESTER_DETAIL(semesterId)}/subjects/${subjectId}/units/${unitId}/topics/${topic.id}`
    );
  };

  // Filter topics
  const filteredTopics = unitTopics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDifficulty =
      difficultyFilter === 'ALL' || t.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            router.push(
              `${ROUTES.SEMESTER_DETAIL(semesterId)}/subjects/${subjectId}`
            )
          }
          className="text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to {subject.name}
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={unit.name}
        subtitle={unit.description || 'Unit syllabus review'}
        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Topic
          </Button>
        }
      />

      {/* Filtering Toolbar */}
      {unitTopics.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search topics, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVISION_REQUIRED">Revision Required</option>
            </select>
          </div>
        </div>
      )}

      {/* Topics list */}
      {filteredTopics.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={
            searchQuery || difficultyFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No results found'
              : 'No topics yet'
          }
          description={
            searchQuery || difficultyFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try modifying your filters or search keywords.'
              : 'Add study topics (e.g., Quick Sort Pivot choices) to begin tracking your placement preparation readiness.'
          }
          {...(!(
            searchQuery ||
            difficultyFilter !== 'ALL' ||
            statusFilter !== 'ALL'
          )
            ? { action: { label: 'Add Topic', onClick: handleOpenCreate } }
            : {})}
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={filteredTopics}
          onReorder={(newOrder) => reorderTopics(unitId, newOrder)}
          className="space-y-3"
        >
          {filteredTopics.map((topic) => (
            <Reorder.Item
              value={topic}
              key={topic.id}
              as="div"
              className="focus-visible:outline-hidden"
            >
              <TopicProgressCard
                topic={topic}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onClick={handleTopicClick}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? 'Edit Topic' : 'Add Topic'}
            </DialogTitle>
          </DialogHeader>
          <TopicForm
            {...(editingTopic
              ? {
                  initialValues: {
                    title: editingTopic.title,
                    description: editingTopic.description,
                    difficulty: editingTopic.difficulty,
                    status: editingTopic.status,
                    estimatedMinutes: editingTopic.estimatedMinutes,
                    tags: editingTopic.tags,
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
        title="Delete Topic?"
        description="This will permanently delete this study topic document and all historical metrics. This action is irreversible."
        variant="danger"
        confirmLabel="Delete Topic"
      />
    </div>
  );
}
