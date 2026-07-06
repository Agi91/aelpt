'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Tag,
  Play,
  Plus,
  BookOpen,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader, EmptyState, StatusBadge } from '@/components/common';
import { ROUTES } from '@/lib/constants/routes';

interface TopicDetailPageProps {
  params: Promise<{
    semesterId: string;
    subjectId: string;
    unitId: string;
    topicId: string;
  }>;
}

const DIFFICULTY_CLASSES = {
  EASY: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  HARD: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
};

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const router = useRouter();
  const { semesterId, subjectId, unitId, topicId } = use(params);

  const { semesters, subjects, units, topics, updateTopic } =
    useAcademicMockStore();
  const {
    logTopicStarted,
    logTopicCompleted,
    logUnderstandingUpdated,
    addStudyMinutes,
  } = useProgressMockStore();

  const semester = semesters.find((s) => s.id === semesterId);
  const subject = subjects.find(
    (s) => s.id === subjectId && s.semesterId === semesterId
  );
  const unit = units.find((u) => u.id === unitId && u.subjectId === subjectId);
  const topic = topics.find((t) => t.id === topicId && t.unitId === unitId);

  // Local state for mock editing features (e.g. updating description, updating understanding score slider)
  const [desc, setDesc] = useState(topic?.description ?? '');
  const [score, setScore] = useState(topic?.understandingScore ?? 0);

  if (!semester || !subject || !unit || !topic) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="Topic not found"
        description="The study topic you are looking for does not exist or has been deleted."
        action={{
          label: 'Back to Semesters',
          onClick: () => router.push(ROUTES.SEMESTERS),
        }}
      />
    );
  }

  const diffClass =
    DIFFICULTY_CLASSES[topic.difficulty] ?? DIFFICULTY_CLASSES.MEDIUM;

  const handleSaveDescription = () => {
    updateTopic(topicId, { description: desc });
  };

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    const updatedStatus = newScore >= 90 ? 'COMPLETED' : topic.status;
    updateTopic(topicId, {
      understandingScore: newScore,
      status: updatedStatus,
    });
    logUnderstandingUpdated(topic.title, newScore);
    if (newScore >= 90 && topic.status !== 'COMPLETED') {
      logTopicCompleted(topic.title);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            router.push(
              `${ROUTES.SEMESTER_DETAIL(semesterId)}/subjects/${subjectId}/units/${unitId}`
            )
          }
          className="text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to {unit.name}
        </Button>
      </div>

      {/* Main topic header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${diffClass}`}
          >
            {topic.difficulty}
          </span>
          <StatusBadge
            status={
              (topic.status === 'NOT_STARTED'
                ? 'not_started'
                : topic.status === 'IN_PROGRESS'
                  ? 'in_progress'
                  : topic.status === 'COMPLETED'
                    ? 'completed'
                    : 'not_started') as
                'not_started' | 'in_progress' | 'completed' | 'mastered'
            }
          />
        </div>

        <PageHeader
          title={topic.title}
          subtitle={`Part of ${unit.name} • ${subject.name}`}
          className="mb-0"
          actions={
            <Button
              onClick={() => {
                logTopicStarted(topic.title);
                addStudyMinutes(15);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Start Study Session
            </Button>
          }
        />

        {/* Tags & Time details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Estimated time: {topic.estimatedMinutes} minutes
          </span>
          {topic.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              {topic.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-muted px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive layout detail grids */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Details (Left/Center) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description / Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Topic Description & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Write a brief overview of this topic, placement preparation targets, or textbook pointers..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveDescription}
                  size="xs"
                  variant="outline"
                >
                  Save Description
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section Placeholder (Phase 6) */}
          <Card className="border-dashed border-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">
                Personal Study Notes
              </CardTitle>
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-600/10 px-2 py-0.5 rounded-full">
                Phase 6 Notes Feature
              </span>
            </CardHeader>
            <CardContent className="text-center py-6 text-muted-foreground text-xs space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p>
                Study notes, formulas, code snippets, and summaries will be
                managed here.
              </p>
              <Button size="xs" variant="ghost" disabled>
                Create Notes Document
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar widgets (Right column) */}
        <div className="space-y-6">
          {/* Interactive Understanding Score widget (Phase 4 mock) */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">
                Understanding Tracker
              </CardTitle>
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Phase 4 Score Engine
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {score}%
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Self-assessed understanding score
                </p>
              </div>

              {/* Range slider for mock interactive scores */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Not Started</span>
                  <span>Mastered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Section Placeholder (Phase 6) */}
          <Card className="border-dashed border-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">
                Learning Resources
              </CardTitle>
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-600/10 px-2 py-0.5 rounded-full">
                Phase 6 Resource Manager
              </span>
            </CardHeader>
            <CardContent className="text-center py-6 text-muted-foreground text-xs space-y-2">
              <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p>
                Save external documentation, YouTube playlists, or reference
                links for this topic.
              </p>
              <Button size="xs" variant="ghost" className="gap-1" disabled>
                <Plus className="h-3 w-3" /> Add Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
