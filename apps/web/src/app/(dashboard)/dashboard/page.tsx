'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  BookOpen,
  Sparkles,
  Layers,
  Calendar,
  Activity,
  Plus,
  ChevronRight,
  Brain,
  Timer,
  PlusCircle,
  Database,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';
import {
  PageHeader,
  SectionHeader,
  EmptyState,
  StatCard,
  StatusBadge,
} from '@/components/common';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Simulated dashboard data (populated state)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_STATS = [
  {
    title: 'Overall Understanding Score',
    value: '78%',
    subtitle: 'Placement Readiness Target: 85%',
    trend: { direction: 'up' as const, label: '+4% this week' },
    icon: <Brain className="h-4 w-4" />,
    accent: 'bg-purple-600/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Topics Completed',
    value: '42 / 120',
    subtitle: 'Across 4 active subjects',
    trend: { direction: 'up' as const, label: '+12 completed' },
    icon: <BookOpen className="h-4 w-4" />,
    accent: 'bg-blue-600/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Active Study Streak',
    value: '5 days',
    subtitle: 'Daily target: 1 focus session',
    trend: { direction: 'up' as const, label: 'Personal best: 14d' },
    icon: <Flame className="h-4 w-4" />,
    accent: 'bg-amber-600/10 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'AI Study Sessions',
    value: '18 queries',
    subtitle: 'Gemini custom mentorship',
    trend: { direction: 'flat' as const, label: 'Consistent usage' },
    icon: <Sparkles className="h-4 w-4" />,
    accent: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400',
  },
];

const MOCK_RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    topic: 'Quicksort & Merge Complexity',
    subject: 'Algorithms & Data Structures',
    timestamp: '2 hours ago',
    type: 'notes',
    score: 85,
  },
  {
    id: 'act-2',
    topic: 'Database Normalization Forms',
    subject: 'Database Management Systems',
    timestamp: 'Yesterday',
    type: 'flashcards',
    score: 62,
  },
  {
    id: 'act-3',
    topic: 'Virtual Memory & Paging',
    subject: 'Operating Systems',
    timestamp: '2 days ago',
    type: 'ai-chat',
    score: 91,
  },
];

const MOCK_PROGRESS_ITEMS = [
  {
    id: 'sub-1',
    name: 'Algorithms & Data Structures',
    progress: 68,
    status: 'in_progress' as const,
    dueCards: 8,
  },
  {
    id: 'sub-2',
    name: 'Database Management Systems',
    progress: 45,
    status: 'in_progress' as const,
    dueCards: 12,
  },
  {
    id: 'sub-3',
    name: 'Operating Systems',
    progress: 90,
    status: 'completed' as const,
    dueCards: 0,
  },
  {
    id: 'sub-4',
    name: 'System Design Principles',
    progress: 0,
    status: 'not_started' as const,
    dueCards: 0,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isEmptyState, setIsEmptyState] = useState(false);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateSemester = () => {
    router.push(ROUTES.SEMESTERS);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top PageHeader */}
      <PageHeader
        title="Dashboard"
        subtitle={`${getGreeting()}, ${profile?.fullName ?? 'Academic Explorer'}. Here is your learning progress overview.`}
        actions={
          <div className="flex items-center gap-2">
            {/* Mock state toggle for testing EmptyState implementation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmptyState(!isEmptyState)}
              className="text-xs h-8"
            >
              <Database className="h-3.5 w-3.5 mr-1" />
              Simulate: {isEmptyState ? 'Populated' : 'Empty'}
            </Button>

            <Button
              size="sm"
              onClick={handleCreateSemester}
              className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Semester
            </Button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      {!isEmptyState ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_STATS.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_STATS.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value="—"
              subtitle="No active trackers"
              accent="bg-muted text-muted-foreground"
            />
          ))}
        </div>
      )}

      {/* Main Responsive Grid Layout (Unequal 2-column on md+) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* LEFT COLUMN: Study Progress & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Study Progress Section */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <SectionHeader
                title="Academic Progress"
                subtitle="Progress & completion metrics for your subjects"
                className="mb-0"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-purple-600 dark:text-purple-400 hover:bg-transparent"
                onClick={() => router.push(ROUTES.SEMESTERS)}
              >
                Manage Semesters
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardHeader>

            <CardContent>
              {isEmptyState ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="No subject progress found"
                  description="Add your first academic semester and define subjects to begin tracking your scores."
                  action={{
                    label: 'Create Semester',
                    onClick: handleCreateSemester,
                  }}
                  className="py-12"
                />
              ) : (
                <div className="space-y-4">
                  {MOCK_PROGRESS_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {item.name}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        {item.dueCards > 0 && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            ⚠️ {item.dueCards} cards due for revision
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex-1 sm:w-28 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>Syllabus Sync</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all duration-500"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => router.push(ROUTES.SEMESTERS)}
                          className="shrink-0"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Section */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <SectionHeader
                title="Recent Activity"
                subtitle="Record of your latest updates & studies"
                className="mb-0"
              />
            </CardHeader>
            <CardContent>
              {isEmptyState ? (
                <EmptyState
                  icon={<Activity className="h-6 w-6" />}
                  title="No recent activities"
                  description="Your study logs, flashcard reviews, and notes adjustments will show up here."
                  className="py-12"
                />
              ) : (
                <div className="space-y-3">
                  {MOCK_RECENT_ACTIVITIES.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/10 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 text-xs">
                          {act.type === 'notes' ? (
                            <PlusCircle className="h-4 w-4" />
                          ) : act.type === 'flashcards' ? (
                            <Layers className="h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {act.subject}
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {act.topic}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block text-[10px] text-muted-foreground mb-0.5">
                          {act.timestamp}
                        </span>
                        {act.score !== undefined && (
                          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            {act.score}% Understanding
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Widgets */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <SectionHeader title="Quick Actions" className="mb-0" />
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium h-9"
                onClick={() => router.push(ROUTES.AI_MENTOR)}
              >
                <Sparkles className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                Ask AI Mentor
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium h-9"
                onClick={() => router.push(ROUTES.FLASHCARDS)}
              >
                <Layers className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                Review Flashcards
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium h-9"
                onClick={() => router.push(ROUTES.PLANNER)}
              >
                <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                {"Today's Schedule"}
              </Button>
            </CardContent>
          </Card>

          {/* Streak & Burnout Widget */}
          <Card className="border-border bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader className="pb-2">
              <SectionHeader title="Streak & Consistency" className="mb-0" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Flame className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {!isEmptyState ? '5 Days Active' : '0 Days Active'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {!isEmptyState
                      ? 'Keep studying daily to maintain your streak!'
                      : 'Complete a study session to initialize streak.'}
                  </p>
                </div>
              </div>

              {/* Focus Session Timer Indicator Widget */}
              <div className="p-3 rounded-lg border border-border bg-card/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" /> Focus Timer
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    Recommended: 25m
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-normal">
                  Engage in a Pomodoro focus session to boost retention and sync
                  results with your score.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
