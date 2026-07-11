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
  Play,
  Clock,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { useRecommendationMockStore } from '@/store/useRecommendationMockStore';
import { useGamificationMockStore } from '@/store/useGamificationMockStore';
import { usePlannerMockStore } from '@/store/usePlannerMockStore';

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { semesters, subjects, units, topics } = useAcademicMockStore();
  const { streakCount, dailyActivities, activityLogs } = useProgressMockStore();
  const { flashcards } = useFlashcardMockStore();
  const { suggestions, dailyPlan } = useRecommendationMockStore();
  const {
    level,
    title,
    progressPercent,
    dailyChallenges,
    weeklyChallenges,
    xp,
  } = useGamificationMockStore();
  const { tasks: plannerTasks, goals: plannerGoals } = usePlannerMockStore();

  const todayStr = new Date().toISOString().split('T')[0]!;
  const todayPlannerGoal = plannerGoals.find((g) => g.date === todayStr);
  const plannerGoalTarget = todayPlannerGoal?.targetMinutes || 60;
  const plannerGoalAchieved = todayPlannerGoal?.achievedMinutes || 0;

  const activePlannerTasks = plannerTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED'
  );
  const nextPlannerTask = activePlannerTasks[0];
  const upcomingDeadlines = activePlannerTasks.slice(0, 3);

  const dueCount = flashcards.filter(
    (c) => new Date(c.nextReviewDate) <= new Date() || c.reps === 0
  ).length;

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
          {/* Spaced Repetition Due Today Banner Widget */}
          {dueCount > 0 && !isEmptyState && (
            <Card className="border-purple-600/30 bg-purple-500/5 dark:bg-purple-950/10">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Spaced Repetition Review Due
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                      You have{' '}
                      <span className="text-rose-500 font-bold">
                        {dueCount} flashcards
                      </span>{' '}
                      scheduled for review today using the SM-2 algorithm.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(ROUTES.FLASHCARDS)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 shrink-0 gap-1"
                >
                  Start Review
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

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

          {/* Today's Planner Goals & Deadlines Widget */}
          {!isEmptyState && (
            <Card className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <SectionHeader
                  title="Today's Planner Goals & Deadlines"
                  subtitle="Track scheduled study tasks and completion metrics"
                  className="mb-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:bg-transparent p-0"
                  onClick={() => router.push(ROUTES.PLANNER)}
                >
                  Go to Planner
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-xs pt-1">
                {/* Today's Goal Progress bar */}
                <div className="space-y-2 p-3 rounded-lg border border-border bg-card/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5 text-purple-600" />{' '}
                      {"Today's Focus Goal"}
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                      {plannerGoalAchieved}m / {plannerGoalTarget}m focused
                    </span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((plannerGoalAchieved / plannerGoalTarget) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Next Task */}
                  <div className="space-y-2">
                    <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Next Study Task
                    </p>
                    {nextPlannerTask ? (
                      <div className="p-2.5 border border-border/50 rounded-lg bg-card flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground truncate">
                            {nextPlannerTask.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {nextPlannerTask.description}
                          </p>
                        </div>
                        <span className="text-[9px] bg-purple-500/10 text-purple-600 font-bold px-1.5 py-0.5 rounded shrink-0 ml-2">
                          {nextPlannerTask.estimatedTime}m
                        </span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">
                        All planner tasks completed.
                      </p>
                    )}
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="space-y-2">
                    <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Upcoming Deadlines
                    </p>
                    <div className="space-y-1.5">
                      {upcomingDeadlines.length > 0 ? (
                        upcomingDeadlines.map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between items-center text-[11px] border-b border-border/40 pb-1"
                          >
                            <span className="text-foreground truncate pr-2">
                              {t.title}
                            </span>
                            <span className="text-purple-600 font-bold shrink-0">
                              {t.dueDate}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-xs italic">
                          No upcoming deadlines.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Study Trend Chart & Insights */}
          {!isEmptyState && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Trend Chart */}
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <SectionHeader
                    title="Weekly Study Hours"
                    subtitle="Track daily focused learning sessions"
                    className="mb-0"
                  />
                </CardHeader>
                <CardContent className="h-60 pt-2 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { dayName: 'Mon', hours: 1.5 },
                        { dayName: 'Tue', hours: 2.2 },
                        { dayName: 'Wed', hours: 0.8 },
                        { dayName: 'Thu', hours: 1.9 },
                        { dayName: 'Fri', hours: 2.5 },
                        { dayName: 'Sat', hours: 0.5 },
                        { dayName: 'Sun', hours: 1.2 },
                      ]}
                      margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="dayName"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit="h"
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Insights Panel */}
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <SectionHeader
                    title="Learning Insights"
                    subtitle="Deterministic performance highlights"
                    className="mb-0"
                  />
                </CardHeader>
                <CardContent className="space-y-2.5 pt-2 text-xs">
                  <div className="p-2.5 border border-border/50 rounded-lg bg-card flex gap-2.5 items-start">
                    <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded bg-purple-500/10 text-purple-600">
                      <Award className="h-4 w-4" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">
                        Peak Quiz Accuracy
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Your highest scored quiz attempt is 85% accuracy.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 border border-border/50 rounded-lg bg-card flex gap-2.5 items-start">
                    <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-600">
                      <Flame className="h-4 w-4" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">
                        Consistency Index
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Active study streak is maintained at {streakCount} days.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Actions & Widgets */}
        <div className="space-y-6">
          {/* AI Study Guide Recommendations */}
          <Card className="border-border bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <SectionHeader title="AI Study Guide" className="mb-0" />
              <Button
                variant="ghost"
                size="xs"
                className="text-xs text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent"
                onClick={() => router.push(ROUTES.RECOMMENDATIONS)}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs">
              {dailyPlan && dailyPlan.dailyGoals.length > 0 ? (
                <>
                  <div className="p-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 space-y-1.5">
                    <p className="font-bold text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Recommended Next Task
                    </p>
                    <p className="font-semibold text-foreground leading-normal">
                      {suggestions[0]?.title || 'Study your weak courses'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {suggestions[0]?.description ||
                        'Complete syllabus mapping.'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wide">
                      {"Today's Study Plan"} ({dailyPlan.estimatedMinutes} mins)
                    </p>
                    {dailyPlan.dailyGoals.slice(0, 3).map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center text-muted-foreground leading-normal"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-600 shrink-0" />
                        <span className="truncate">{goal}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<Sparkles className="h-6 w-6 text-purple-600" />}
                  title="No active recommendations"
                  description="Complete learning materials or take a quiz to get recommendations."
                  className="py-6"
                />
              )}
            </CardContent>
          </Card>

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

          {/* Gamification, Challenges & Leaderboard Dashboard widgets */}
          <Card className="border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <SectionHeader title="Level & XP Progression" className="mb-0" />
              <Button
                variant="ghost"
                size="xs"
                className="text-xs text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent"
                onClick={() => router.push('/achievements')}
              >
                Milestones
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-extrabold text-lg">
                  {level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">
                    Level {level}: {title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {xp} total XP. {1000 - (xp % 1000)} XP to next level
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>LEVEL PROGRESS</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily & Weekly Challenges Checklist */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <SectionHeader title="Active Challenges" className="mb-0" />
            </CardHeader>
            <CardContent className="space-y-3.5 pt-1 text-xs">
              {/* Daily */}
              <div className="space-y-2">
                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wide">
                  Daily Challenge
                </p>
                {dailyChallenges.slice(0, 2).map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {c.description}
                      </span>
                      <span className="font-bold text-foreground">
                        {c.currentCount}/{c.targetCount}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.round((c.currentCount / c.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly */}
              <div className="space-y-2 border-t border-border/40 pt-3">
                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wide">
                  Weekly Challenge
                </p>
                {weeklyChallenges.slice(0, 2).map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {c.description}
                      </span>
                      <span className="font-bold text-foreground">
                        {c.currentCount}/{c.targetCount}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.round((c.currentCount / c.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mock Leaderboard Preview widget */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <SectionHeader title="Class Leaderboard" className="mb-0" />
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1 text-xs">
              {[
                { rank: 1, name: 'Alice', level: 8, xp: 7200, avatar: 'A' },
                { rank: 2, name: 'Bob', level: 6, xp: 5400, avatar: 'B' },
                {
                  rank: 3,
                  name: 'You',
                  level,
                  xp,
                  avatar: 'Y',
                  isCurrentUser: true,
                },
                { rank: 4, name: 'Charlie', level: 4, xp: 3800, avatar: 'C' },
              ].map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    entry.isCurrentUser
                      ? 'border-purple-600 bg-purple-500/5 ring-1 ring-purple-600/20'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-[10px] text-muted-foreground w-4">
                      #{entry.rank}
                    </span>
                    <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[10px]">
                      {entry.avatar}
                    </span>
                    <span className="font-semibold text-foreground truncate">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                    Lvl {entry.level} • {entry.xp} XP
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
