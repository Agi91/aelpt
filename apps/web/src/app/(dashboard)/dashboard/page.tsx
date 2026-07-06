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
  Zap,
  Award,
  Play,
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
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { semesters, subjects, units, topics } = useAcademicMockStore();
  const { streakCount, dailyActivities, activityLogs, achievements } =
    useProgressMockStore();

  const [simulationEmpty, setSimulationEmpty] = useState<boolean | null>(null);
  const isEmptyState =
    simulationEmpty !== null ? simulationEmpty : semesters.length === 0;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateSemester = () => {
    router.push(ROUTES.SEMESTERS);
  };

  // Calculate live KPI metrics
  const activeTopics = topics;
  const avgUnderstanding =
    activeTopics.length > 0
      ? Math.round(
          activeTopics.reduce((acc, curr) => acc + curr.understandingScore, 0) /
            activeTopics.length
        )
      : 0;

  const completedTopicsCount = topics.filter(
    (t) => t.status === 'COMPLETED'
  ).length;
  const totalTopicsCount = topics.length;

  const totalStudyMinutes = dailyActivities.reduce(
    (acc, curr) => acc + curr.minutesStudied,
    0
  );

  const stats = [
    {
      title: 'Overall Understanding Score',
      value: `${avgUnderstanding}%`,
      subtitle: 'Placement Readiness Target: 85%',
      trend: { direction: 'up' as const, label: '+4% this week' },
      icon: <Brain className="h-4 w-4" />,
      accent: 'bg-purple-600/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Topics Completed',
      value: `${completedTopicsCount} / ${totalTopicsCount}`,
      subtitle: `Across ${subjects.length} active subjects`,
      trend: {
        direction: 'up' as const,
        label: `+${completedTopicsCount} completed`,
      },
      icon: <BookOpen className="h-4 w-4" />,
      accent: 'bg-blue-600/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Study Streak',
      value: `${streakCount} days`,
      subtitle: 'Daily target: 1 focus session',
      trend: { direction: 'up' as const, label: 'Personal best: 14d' },
      icon: <Flame className="h-4 w-4" />,
      accent: 'bg-amber-600/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Total Study Time',
      value: `${totalStudyMinutes} mins`,
      subtitle: 'Accumulated focus session logs',
      trend: { direction: 'flat' as const, label: 'Consistent usage' },
      icon: <Timer className="h-4 w-4" />,
      accent: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

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
              onClick={() =>
                setSimulationEmpty(
                  simulationEmpty === null ? true : !simulationEmpty
                )
              }
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
          {stats.map((stat) => (
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
          {stats.map((stat) => (
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
              {isEmptyState || subjects.length === 0 ? (
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
                  {subjects.map((sub) => {
                    const subjectUnits = units.filter(
                      (u) => u.subjectId === sub.id
                    );
                    const unitIds = subjectUnits.map((u) => u.id);
                    const subjectTopics = topics.filter((t) =>
                      unitIds.includes(t.unitId)
                    );
                    const dueRevisionCount = subjectTopics.filter(
                      (t) => t.status === 'REVISION_REQUIRED'
                    ).length;

                    const status =
                      sub.progress >= 100
                        ? ('completed' as const)
                        : sub.progress > 0
                          ? ('in_progress' as const)
                          : ('not_started' as const);

                    return (
                      <div
                        key={sub.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {sub.name}
                            </span>
                            <StatusBadge status={status} />
                          </div>
                          {dueRevisionCount > 0 && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              ⚠️ {dueRevisionCount} topics require revision
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex-1 sm:w-28 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                              <span>Syllabus Sync</span>
                              <span>{sub.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${sub.progress}%` }}
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              router.push(
                                `${ROUTES.SEMESTERS}/${sub.semesterId}`
                              )
                            }
                            className="shrink-0"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
              {isEmptyState || activityLogs.length === 0 ? (
                <EmptyState
                  icon={<Activity className="h-6 w-6" />}
                  title="No recent activities"
                  description="Your study logs, flashcard reviews, and notes adjustments will show up here."
                  className="py-12"
                />
              ) : (
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/10 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 text-xs">
                          {log.type === 'TOPIC_COMPLETED' ? (
                            <PlusCircle className="h-4 w-4" />
                          ) : log.type === 'TOPIC_STARTED' ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Activity className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {log.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {log.message}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
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
                    {!isEmptyState
                      ? `${streakCount} Days Active`
                      : '0 Days Active'}
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

          {/* Achievements & Milestones */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <SectionHeader
                title="Achievements & Milestones"
                className="mb-0"
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {isEmptyState ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No active milestones
                </p>
              ) : (
                achievements.map((ach) => {
                  const IconComponent =
                    ach.icon === 'Zap'
                      ? Zap
                      : ach.icon === 'Brain'
                        ? Brain
                        : ach.icon === 'Award'
                          ? Award
                          : BookOpen;
                  const isUnlocked = ach.unlockedAt !== undefined;
                  return (
                    <div
                      key={ach.id}
                      className="space-y-1.5 p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                            isUnlocked
                              ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {ach.title}
                            </p>
                            {isUnlocked ? (
                              <span className="text-[9px] bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.2 rounded-full font-bold">
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-[9px] text-muted-foreground font-medium">
                                {ach.progress}%
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {ach.description}
                          </p>
                        </div>
                      </div>
                      {!isUnlocked && (
                        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${ach.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
