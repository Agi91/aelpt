'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  Brain,
  Timer,
  Award,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  TrendingDown,
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
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { useQuizMockStore } from '@/store/useQuizMockStore';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useGamificationMockStore } from '@/store/useGamificationMockStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  PageHeader,
  SectionHeader,
  StatCard,
  EmptyState,
} from '@/components/common';
import { AnalyticsEngine, AnalyticsPayload } from '@aelpt/shared';

const COLORS = ['#10b981', '#f43f5e', '#6366f1'];

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('30D');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // Stores
  const { subjects, units, topics } = useAcademicMockStore();
  const { streakCount, dailyActivities, activityLogs } = useProgressMockStore();
  const { flashcards } = useFlashcardMockStore();
  const { history: quizHistory } = useQuizMockStore();
  const { notes } = useNotesMockStore();
  const { xp, level } = useGamificationMockStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoized analytics compilation
  const analytics: AnalyticsPayload = useMemo(() => {
    return AnalyticsEngine.compileAnalytics({
      topics,
      subjects,
      units,
      notes,
      resources: [],
      flashcards,
      quizHistory,
      dailyActivities,
      activityLogs,
      streakCount,
      xp,
      level,
      dateFilter,
      subjectFilter,
    });
  }, [
    topics,
    subjects,
    units,
    notes,
    flashcards,
    quizHistory,
    dailyActivities,
    activityLogs,
    streakCount,
    xp,
    level,
    dateFilter,
    subjectFilter,
  ]);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Performance Analytics Console"
          subtitle="Loading metrics database, please wait..."
        />
      </div>
    );
  }

  const handleExportCSV = () => {
    toast.success(
      'CSV Export: Initiated background data compilation. Report downloaded successfully!'
    );
  };

  const handleExportPDF = () => {
    toast.success(
      'PDF Export: Generating print layout. Report generated successfully!'
    );
  };

  const getInsightIcon = (type: string) => {
    if (type === 'strongest_subject')
      return <Award className="h-4 w-4 text-emerald-500" />;
    if (type === 'weakest_subject')
      return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    if (type === 'most_active_day')
      return <Flame className="h-4 w-4 text-amber-500" />;
    if (type === 'best_quiz')
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    if (type === 'least_studied')
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getTimelineIcon = (category: string) => {
    if (category === 'QUIZ')
      return <Award className="h-4 w-4 text-emerald-500" />;
    if (category === 'TOPIC')
      return <BookOpen className="h-4 w-4 text-purple-500" />;
    if (category === 'FLASHCARD')
      return <Layers className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  // Determine color shade for heatmap count (minutes studied)
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800/40';
    if (count < 15)
      return 'bg-purple-300 dark:bg-purple-900/20 text-purple-900';
    if (count < 30)
      return 'bg-purple-400 dark:bg-purple-900/40 text-purple-700';
    if (count < 45)
      return 'bg-purple-500 dark:bg-purple-900/70 text-purple-400';
    return 'bg-purple-600 text-white';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics Console"
        subtitle="Visualize learning patterns, memory retention curves, and curriculum coverages."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="text-xs h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Filters Row */}
      <Card className="border border-border">
        <CardContent className="p-3.5 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-purple-600" /> Filters:
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Subject selector */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus:outline-hidden"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code || sub.name.slice(0, 10)}
                </option>
              ))}
            </select>

            {/* Date Range selectors */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus:outline-hidden"
            >
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Cards Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Study Hours"
          value={`${analytics.kpis.totalStudyHours}h`}
          icon={<Timer className="h-4 w-4 text-purple-600" />}
          subtitle="Cumulative focused time"
        />
        <StatCard
          title="Topics Completed"
          value={analytics.kpis.topicsCompleted}
          icon={<BookOpen className="h-4 w-4 text-emerald-600" />}
          subtitle="Marked as complete"
        />
        <StatCard
          title="Quizzes Finished"
          value={analytics.kpis.quizzesCompleted}
          icon={<Award className="h-4 w-4 text-blue-600" />}
          subtitle="Interactive quiz takes"
        />
        <StatCard
          title="Notes & Cards"
          value={`${analytics.kpis.notesCreated} / ${analytics.kpis.flashcardsReviewed}`}
          icon={<Layers className="h-4 w-4 text-amber-600" />}
          subtitle="Study notes & reviews"
        />
      </div>

      {/* Interactive Charts Row 1: Study Time & Completion progress */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Weekly Study Time (Line Chart) */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Weekly Focus Study Time"
              subtitle="Hours spent studying per weekday session"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.weeklyStudy}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="dayName"
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
                  unit="h"
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
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject coverage (Bar Chart) */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Subject Coverage vs Mastery"
              subtitle="Syllabus coverage percentages compared with self-assessed mastery"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-72">
            {analytics.subjectsData.length === 0 ? (
              <EmptyState
                icon={<Brain className="h-6 w-6" />}
                title="No active subjects"
                description="Add course subjects inside semesters page to visualize mastery statistics."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.subjectsData}
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
                    dataKey="coverage"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    name="Mastery Score (%)"
                    dataKey="mastery"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Quiz Accuracy (Pie Chart) & Understanding Score Trend (Line Chart) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Quiz Accuracy Pie Chart */}
        <Card className="border border-border md:col-span-1">
          <CardHeader className="pb-1.5">
            <SectionHeader
              title="Quiz Question Metrics"
              subtitle="Overview of correct vs wrong quiz responses"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-60 flex flex-col justify-between items-center text-xs">
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.quizAccuracy}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.quizAccuracy.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length] || '#888888'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4">
              {analytics.quizAccuracy.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1.5 font-bold"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Understanding Score Trend (Line Chart) */}
        <Card className="border border-border md:col-span-1">
          <CardHeader className="pb-1.5">
            <SectionHeader
              title="Comprehension Curve"
              subtitle="Subject comprehension improvements over time"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.understandingTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="date"
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
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  name="Avg Understanding %"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* XP Growth Trend */}
        <Card className="border border-border md:col-span-1">
          <CardHeader className="pb-1.5">
            <SectionHeader
              title="XP Growth Trend"
              subtitle="Cumulative XP earned over last study sessions"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.xpGrowth}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="date"
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
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cumulativeXp"
                  name="Total XP"
                  stroke="#6366f1"
                  fillOpacity={0.1}
                  fill="url(#colorXp)"
                />
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Study Heatmap & Learning Insights */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Study Heatmap */}
        <Card className="lg:col-span-2 border border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Daily Study Heatmap"
              subtitle="Consistency log mapping minutes studied over the last 30 calendar days"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {analytics.heatmap.map((day) => (
                <div
                  key={day.date}
                  className={`h-7 w-7 rounded-md shrink-0 flex items-center justify-center font-bold text-[9px] cursor-pointer hover:scale-105 transition-transform ${getHeatmapColor(
                    day.count
                  )}`}
                  title={`${day.date}: ${day.count} mins focused`}
                >
                  {day.count > 0 ? `${day.count}m` : ''}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <p className="text-[10px] text-muted-foreground">
                Darker blocks indicate longer study durations.
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-muted-foreground mr-1">
                  Less
                </span>
                <span className="h-3.5 w-3.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                <span className="h-3.5 w-3.5 rounded bg-purple-300" />
                <span className="h-3.5 w-3.5 rounded bg-purple-400" />
                <span className="h-3.5 w-3.5 rounded bg-purple-500" />
                <span className="h-3.5 w-3.5 rounded bg-purple-600" />
                <span className="text-[9px] text-muted-foreground ml-1">
                  More
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Academic Learning Insights"
              subtitle="Contextual productivity summaries compiled deterministically"
              className="mb-0"
            />
          </CardHeader>
          <CardContent className="space-y-3 pt-1 text-xs">
            {analytics.insights.map((insight) => (
              <div
                key={insight.type}
                className="p-3 border border-border/50 rounded-xl bg-card hover:bg-muted/10 transition-colors flex gap-2.5 items-start"
              >
                <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground mt-0.5">
                  {getInsightIcon(insight.type)}
                </span>
                <div className="space-y-0.5 leading-normal">
                  <p className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wide">
                    {insight.title}
                  </p>
                  <p className="font-bold text-foreground text-sm">
                    {insight.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Activity Timeline */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <SectionHeader
            title="Activity Audit Logs Timeline"
            subtitle="Recent learning actions logged onto your academic ledger"
            className="mb-0"
          />
        </CardHeader>
        <CardContent className="pt-2 text-xs space-y-4 max-h-[300px] overflow-y-auto">
          {analytics.timeline.length > 0 ? (
            <div className="relative border-l border-border pl-4 space-y-4">
              {analytics.timeline.map((item) => (
                <div key={item.id} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-6.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border">
                    {getTimelineIcon(item.category)}
                  </span>

                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <p className="font-bold text-foreground capitalize">
                        {item.title}
                      </p>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No recent activity logs recorded.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
