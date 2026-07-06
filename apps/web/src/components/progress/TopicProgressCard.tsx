'use client';

import React from 'react';
import { Topic } from '@aelpt/shared';
import { Clock, Tag, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';

interface TopicProgressCardProps {
  topic: Topic;
  onEdit: (topic: Topic) => void;
  onDelete: (id: string) => void;
  onClick: (topic: Topic) => void;
}

const DIFFICULTY_CLASSES = {
  EASY: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  HARD: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
};

export function TopicProgressCard({
  topic,
  onEdit,
  onDelete,
  onClick,
}: TopicProgressCardProps) {
  const diffClass =
    DIFFICULTY_CLASSES[topic.difficulty] ?? DIFFICULTY_CLASSES.MEDIUM;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(topic);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(topic.id);
  };

  return (
    <div
      onClick={() => onClick(topic)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/10 transition-all cursor-pointer gap-4 shadow-2xs hover:shadow-xs"
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-1 cursor-grab active:cursor-grabbing shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Badge */}
            <span
              className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${diffClass}`}
            >
              {topic.difficulty}
            </span>
            {/* Status Badge */}
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

          {/* Title & Desc */}
          <div>
            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {topic.title}
            </h4>
            {topic.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {topic.description}
              </p>
            )}
          </div>

          {/* Tags and Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {topic.estimatedMinutes} mins
            </span>
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-muted px-1.5 py-0.2 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Understanding Score & Action Buttons */}
      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border">
        {/* Score tracker */}
        <div className="text-left md:text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">
            Understanding
          </p>
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {topic.status === 'NOT_STARTED'
              ? '—'
              : `${topic.understandingScore}%`}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleEditClick}
            aria-label="Edit Topic"
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDeleteClick}
            aria-label="Delete Topic"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
