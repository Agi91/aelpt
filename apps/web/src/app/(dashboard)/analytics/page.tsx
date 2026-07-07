'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  BookOpen,
  Sparkles,
  Layers,
  Calendar,
  Activity,
  Brain,
  Timer,
  Award,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  PageHeader,
  SectionHeader,
  StatCard,
  CardSkeleton,
  EmptyState,
} from '@/components/common';
import { ROUTES } from '@/lib/constants/routes';

interface Recommendation {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const { semesters, subjects, units, topics } = useAcademicMockStore();
  const { streakCount, dailyActivities, achievements } = useProgressMockStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Track your learning progress over time."
        />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Calculate global summary states
  const totalStudyMinutes = dailyActivities.reduce(
    (acc, curr) => acc + curr.minutesStudied,
    0
  );
  const avgSessionLength =
    dailyActivities.length > 0
      ? Math.round(
          totalStudyMinutes /
            dailyActivities.filter((a) => a.minutesStudied > 0).length || 1
        )
      : 0;

  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'COMPLETED').length;

  const activeTopics = topics;
  const avgUnderstanding =
    activeTopics.length > 0
      ? Math.round(
          activeTopics.reduce((acc, curr) => acc + curr.understandingScore, 0) /
            activeTopics.length
        )
      : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. WEEKLY STUDY VOLUME CHART (Last 7 Days)
  // ─────────────────────────────────────────────────────────────────────────────
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().slice(0, 10);
    const storeAct = dailyActivities.find((act) => act.date === dateStr);
    return {
      day: dayName,
      Minutes: storeAct ? storeAct.minutesStudied : 0,
      Topics: storeAct ? storeAct.topicsCompleted : 0,
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SUBJECT-WISE PROGRESS VS UNDERSTANDING CHART
  // ─────────────────────────────────────────────────────────────────────────────
  const subjectChartData = subjects.map((sub) => {
    const subjectUnits = units.filter((u) => u.subjectId === sub.id);
    const unitIds = subjectUnits.map((u) => u.id);
    const subjectTopics = topics.filter((t) => unitIds.includes(t.unitId));
    const completedSubjectTopics = subjectTopics.filter(
      (t) => t.status === 'COMPLETED'
    );
    const totalScore = completedSubjectTopics.reduce(
      (acc, curr) => acc + curr.understandingScore,
      0
    );
    const avgSubUnderstanding =
      completedSubjectTopics.length > 0
        ? Math.round(totalScore / completedSubjectTopics.length)
        : 0;

    return {
      subjectCode: sub.code || sub.name.slice(0, 8),
      subjectName: sub.name,
      Syllabus: sub.progress,
      Understanding: avgSubUnderstanding,
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. STUDY HEATMAP (GitHub-style calendar grid)
  // ─────────────────────────────────────────────────────────────────────────────
  const generateHeatmapGrid = () => {
    const today = new Date();
    const grid = [];
    // 16 weeks = 112 days
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const storeAct = dailyActivities.find((act) => act.date === dateStr);

      let minutes = storeAct ? storeAct.minutesStudied : 0;
      // Seed older data for visual aesthetics if empty
      if (!storeAct && i > 10) {
        const seededHash = (i * 23) % 10;
        if (seededHash < 3) {
          minutes = [25, 50, 75, 120][seededHash % 4] ?? 0;
        }
      }
      grid.push({ dateStr, minutes, dateObj: d });
    }
    return grid;
  };

  const heatmapCells = generateHeatmapGrid();

  // Color mappings for Heatmap intensity
  const getIntensityClass = (mins: number) => {
    if (mins === 0)
      return 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40';
    if (mins <= 30)
      return 'bg-purple-500/20 dark:bg-purple-400/10 border border-purple-500/10';
    if (mins <= 60)
      return 'bg-purple-500/40 dark:bg-purple-400/30 border border-purple-500/20';
    if (mins <= 90)
      return 'bg-purple-500/70 dark:bg-purple-400/60 border border-purple-500/30';
    return 'bg-purple-600 text-white dark:bg-purple-500 border border-purple-600';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. RULE-BASED STUDY INSIGHTS & RECOMMENDATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const getRecommendations = (): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Rule 1: Subject lagging behind in syllabus completion
    const laggingSubject = subjects.find((s) => s.progress < 40);
    if (laggingSubject) {
      recs.push({
        id: 'rec_syllabus',
        type: 'critical',
        title: 'Syllabus Catch-up Required',
        message: `Your syllabus completion for "${laggingSubject.name}" is only ${laggingSubject.progress}%. Prioritize mapping course units next.`,
      });
    }

    // Rule 2: Low understanding score warning
    const lowUnderstandingTopic = topics.find(
      (t) => t.understandingScore > 0 && t.understandingScore < 70
    );
    if (lowUnderstandingTopic) {
      recs.push({
        id: 'rec_mastery',
        type: 'warning',
        title: 'Retention Review Needed',
        message: `Topic "${lowUnderstandingTopic.title}" has a self-assessed understanding score of ${lowUnderstandingTopic.understandingScore}%. Try a review session today.`,
      });
    }

    // Rule 3: High difficulty topics mapping reminder
    const hardNotStarted = topics.filter(
      (t) => t.difficulty === 'HARD' && t.status === 'NOT_STARTED'
    );
    const firstHard = hardNotStarted[0];
    if (firstHard) {
      recs.push({
        id: 'rec_hard',
        type: 'info',
        title: 'Breakdown Difficult Topics',
        message: `You have ${hardNotStarted.length} hard topics pending. Consider starting with "${firstHard.title}" first.`,
      });
    }

    // Rule 4: Streak booster reminder
    if (streakCount < 3) {
      recs.push({
        id: 'rec_streak',
        type: 'info',
        title: 'Build Study Consistency',
        message:
          'Study for at least 15 minutes today to increase your active study streak count.',
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Study Insights"
        subtitle="Review syllabus coverage progress, recall strengths, active streaks, and accomplishments."
        actions={
          <Button
            onClick={() => router.push(ROUTES.SEMESTERS)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Layers className="h-3.5 w-3.5 mr-1" />
            Study Materials
          </Button>
        }
      />

      {/* KPI stats section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Study Minutes"
          value={`${totalStudyMinutes} mins`}
          subtitle="Overall accumulated study time"
          icon={<Timer className="h-4 w-4" />}
          accent="bg-purple-600/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Average Session Duration"
          value={`${avgSessionLength} mins`}
          subtitle="Time per logged focus day"
          icon={<TrendingUp className="h-4 w-4" />}
          accent="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Syllabus Completion"
          value={`${completedTopics} / ${totalTopics}`}
          subtitle="Topics marked as completed"
          icon={<BookOpen className="h-4 w-4" />}
          accent="bg-blue-600/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Understanding Score"
          value={`${avgUnderstanding}%`}
          subtitle="Self-assessed recall mastery"
          icon={<Brain className="h-4 w-4" />}
          accent="bg-amber-600/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Grid: Heatmap + Weekly chart */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Heatmap Widget (spans all columns) */}
        <Card className="lg:col-span-3 border-border">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <SectionHeader
                title="Consistency Grid"
                subtitle="GitHub-style study heat map logs over the last 16 weeks"
                className="mb-0"
              />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/40 px-2.5 py-1 rounded-lg">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500/10" />
                <span>Streak: {streakCount} Days</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {semesters.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="No calendar logs found"
                description="Set up your academic semester to initialize your consistency heat map grid."
              />
            ) : (
              <div className="space-y-4">
                {/* Horizontal scroll on mobile */}
                <div className="overflow-x-auto pb-2 scrollbar-thin">
                  <div className="flex flex-wrap gap-1 min-w-[700px] select-none">
                    {heatmapCells.map((cell, idx) => (
                      <div
                        key={idx}
                        className={`h-3 w-3 rounded-xs shrink-0 cursor-pointer transition-colors duration-150 ${getIntensityClass(
                          cell.minutes
                        )}`}
                        title={`${cell.dateStr}: ${cell.minutes} minutes studied`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-1.5 border-t border-border">
                  <span>16 weeks ago</span>
                  <div className="flex items-center gap-1">
                    <span>Less</span>
                    <div className="h-2.5 w-2.5 rounded-xs bg-zinc-100 dark:bg-zinc-900 border border-border" />
                    <div className="h-2.5 w-2.5 rounded-xs bg-purple-500/20" />
                    <div className="h-2.5 w-2.5 rounded-xs bg-purple-500/50" />
                    <div className="h-2.5 w-2.5 rounded-xs bg-purple-500/80" />
                    <div className="h-2.5 w-2.5 rounded-xs bg-purple-600 dark:bg-purple-500" />
                    <span>More</span>
                  </div>
                  <span>Today</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid: Recharts statistics */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Weekly Study Volume (BarChart) */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Weekly Focus Sessions"
              subtitle="Daily minutes studied and topics completed over the last 7 days"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-80">
            {semesters.length === 0 ? (
              <EmptyState
                icon={<Activity className="h-6 w-6" />}
                title="No weekly data"
                description="Add subjects and study topics to start visualizing focus session metrics."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={last7DaysData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: 'Minutes',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid rgba(63, 63, 70, 0.5)',
                      color: '#ffffff',
                    }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '12px', color: '#a855f7' }}
                  />
                  <Bar
                    dataKey="Minutes"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Subject-wise Progress & Gaps (Grouped BarChart) */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Subject Coverage vs Mastery"
              subtitle="Syllabus coverage percentages compared with self-assessed mastery"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-80">
            {subjects.length === 0 ? (
              <EmptyState
                icon={<Brain className="h-6 w-6" />}
                title="No active subjects"
                description="Add course subjects inside semesters page to visualize mastery statistics."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="subjectCode"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid rgba(63, 63, 70, 0.5)',
                      color: '#ffffff',
                    }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    name="Syllabus Coverage (%)"
                    dataKey="Syllabus"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    name="Mastery Score (%)"
                    dataKey="Understanding"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row: Productivity Insights & Recommendations */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Study Recommendations */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Personal Study Recommendations"
              subtitle="Rule-based study suggestions derived from your mapped course structures"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {semesters.length === 0 ? (
              <EmptyState
                icon={<Lightbulb className="h-6 w-6" />}
                title="No recommendations yet"
                description="Populate your courses to unlock study recommendations."
              />
            ) : recommendations.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">
                  All clear! You are fully caught up with your study targets
                  today.
                </span>
              </div>
            ) : (
              <div className="grid gap-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-normal ${
                      rec.type === 'critical'
                        ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20 text-rose-700 dark:text-rose-400'
                        : rec.type === 'warning'
                          ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20 text-amber-700 dark:text-amber-400'
                          : 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/20 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {rec.type === 'critical' ? (
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      ) : rec.type === 'warning' ? (
                        <Info className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                      )}
                    </span>
                    <div>
                      <h4 className="font-bold mb-0.5">{rec.title}</h4>
                      <p className="text-muted-foreground">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements Milestone Checklist */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Unlocked Achievements"
              subtitle="Special academic milestones"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {semesters.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No achievements setup yet
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
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-border bg-card"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
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
                        {isUnlocked && (
                          <span className="text-[8px] bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.2 rounded-full font-bold">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
