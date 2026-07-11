'use client';

import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Tag,
  List,
  Layers,
  Archive,
  Copy,
  TrendingUp,
  Brain,
  Filter,
  Play,
  RotateCw,
  Search,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState, StatCard } from '@/components/common';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useRecommendationMockStore } from '@/store/useRecommendationMockStore';
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { usePlannerMockStore } from '@/store/usePlannerMockStore';
import {
  StudyTask,
  TaskPriority,
  TaskStatus,
  PlannerFilter,
  Subject,
} from '@aelpt/shared';

export default function PlannerPage() {
  const { subjects, topics } = useAcademicMockStore();
  const { suggestions } = useRecommendationMockStore();
  const { flashcards } = useFlashcardMockStore();

  const {
    tasks,
    goals,
    addTask,
    editTask,
    deleteTask,
    completeTask,
    archiveTask,
    duplicateTask,
    generatePlans,
  } = usePlannerMockStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST' | 'TIMELINE'>(
    'KANBAN'
  );
  const [filters, setFilters] = useState<PlannerFilter>({
    subjectId: 'ALL',
    priority: 'ALL',
    status: 'ALL',
    dateRange: 'ALL',
  });

  // Task creation Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
  const [newEst, setNewEst] = useState(30);
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split('T')[0]!
  );
  const [newSubId, setNewSubId] = useState('');
  const [newTopId, setNewTopId] = useState('');
  const [newTagsStr, setNewTagsStr] = useState('');

  const [isPending, startTransition] = useTransition();

  const dueCount = flashcards.filter(
    (c) => new Date(c.nextReviewDate) <= new Date() || c.reps === 0
  ).length;

  const handleGenerateSmartPlan = () => {
    if (topics.length === 0) {
      toast.error(
        'Add course subjects and topics first to compile smart planners.'
      );
      return;
    }
    startTransition(() => {
      generatePlans(topics, subjects, suggestions, dueCount);
    });
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Task title is required.');
      return;
    }

    addTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'TODO',
      estimatedTime: Number(newEst),
      dueDate: newDate,
      ...(newSubId ? { subjectId: newSubId } : {}),
      ...(newTopId ? { topicId: newTopId } : {}),
      tags: newTagsStr
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewPriority('MEDIUM');
    setNewEst(30);
    setNewDate(new Date().toISOString().split('T')[0]!);
    setNewSubId('');
    setNewTopId('');
    setNewTagsStr('');
    setShowAddForm(false);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (t.status === 'ARCHIVED') return false; // Hide archived by default

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filters.subjectId !== 'ALL' && t.subjectId !== filters.subjectId)
      return false;
    if (filters.priority !== 'ALL' && t.priority !== filters.priority)
      return false;
    if (filters.status !== 'ALL' && t.status !== filters.status) return false;

    const todayStr = new Date().toISOString().split('T')[0]!;
    if (filters.dateRange === 'TODAY' && t.dueDate !== todayStr) return false;
    if (filters.dateRange === 'UPCOMING' && t.dueDate < todayStr) return false;
    if (filters.dateRange === 'COMPLETED' && t.status !== 'COMPLETED')
      return false;

    return true;
  });

  // KPI Calculations
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const remainingCount = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED'
  ).length;
  const totalHours = Number(
    (
      tasks.reduce(
        (acc, curr) =>
          acc + (curr.status === 'COMPLETED' ? curr.estimatedTime : 0),
        0
      ) / 60
    ).toFixed(1)
  );

  const todayGoal = goals.find(
    (g) => g.date === new Date().toISOString().split('T')[0]!
  );
  const todayGoalTarget = todayGoal?.targetMinutes || 60;
  const todayGoalAchieved = todayGoal?.achievedMinutes || 0;
  const productivityPercent =
    tasks.length > 0
      ? Math.round(
          (completedCount /
            tasks.filter((t) => t.status !== 'ARCHIVED').length) *
            100
        )
      : 0;

  const getPriorityColor = (p: TaskPriority) => {
    if (p === 'HIGH')
      return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    if (p === 'MEDIUM')
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
  };

  const getStatusColor = (s: TaskStatus) => {
    if (s === 'COMPLETED')
      return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600';
    if (s === 'IN_PROGRESS')
      return 'border-blue-500/30 bg-blue-500/5 text-blue-600';
    return 'border-border bg-card text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Study Planner"
        subtitle="Organize deadlines, map daily checklists, and dynamically compile custom study tasks."
        actions={
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateSmartPlan}
              disabled={isPending || topics.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 gap-1.5"
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              Smart Study Generator
            </Button>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={completedCount}
          icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
          subtitle={`${remainingCount} remaining in backlog`}
        />
        <StatCard
          title="Total Study Time"
          value={`${totalHours}h`}
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          subtitle="From completed schedules"
        />
        <StatCard
          title="Today's Study Goal"
          value={`${todayGoalAchieved}m / ${todayGoalTarget}m`}
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
          subtitle={`${Math.max(0, todayGoalTarget - todayGoalAchieved)} mins remaining`}
        />
        <StatCard
          title="Productivity Ratio"
          value={`${productivityPercent}%`}
          icon={<Brain className="h-4 w-4 text-blue-600" />}
          subtitle="Completed vs active tasks"
        />
      </div>

      {/* Quick Add Form Section */}
      {showAddForm && (
        <Card className="border border-purple-600/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Add New Study Task
            </h3>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleAddTaskSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-muted-foreground">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Study OSI Transport Protocols"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as TaskPriority)
                    }
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail concept mappings, textbook references, or recall decks..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Estimated Minutes */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={newEst}
                    onChange={(e) => setNewEst(Number(e.target.value))}
                    min={5}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs"
                  />
                </div>

                {/* Subject Mapped */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Course Subject
                  </label>
                  <select
                    value={newSubId}
                    onChange={(e) => setNewSubId(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden"
                  >
                    <option value="">No subject link</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code || sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                    placeholder="OS, Quiz, SDLC"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Create Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Control Console: View toggles & Filters */}
      <Card className="border border-border">
        <CardContent className="p-3.5 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* View Mode buttons */}
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`px-3 py-1.5 font-bold border-r border-border gap-1 flex items-center transition-all ${
                  viewMode === 'KANBAN'
                    ? 'bg-purple-500/5 text-purple-700 dark:text-purple-400'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/10'
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Kanban Board
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 font-bold border-r border-border gap-1 flex items-center transition-all ${
                  viewMode === 'LIST'
                    ? 'bg-purple-500/5 text-purple-700 dark:text-purple-400'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/10'
                }`}
              >
                <List className="h-3.5 w-3.5" /> List View
              </button>
              <button
                onClick={() => setViewMode('TIMELINE')}
                className={`px-3 py-1.5 font-bold gap-1 flex items-center transition-all ${
                  viewMode === 'TIMELINE'
                    ? 'bg-purple-500/5 text-purple-700 dark:text-purple-400'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/10'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" /> Timeline View
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 w-44 sm:w-56">
              <span className="absolute left-2.5 top-2 text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study tasks..."
                className="w-full pl-8 rounded-md border border-input bg-transparent px-3 py-1 text-xs focus:outline-hidden h-7.5 shadow-2xs"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase tracking-wide shrink-0">
              <Filter className="h-3.5 w-3.5 text-purple-600" /> Filters:
            </span>

            {/* Subject Filter */}
            <select
              value={filters.subjectId}
              onChange={(e) =>
                setFilters({ ...filters, subjectId: e.target.value })
              }
              className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code || sub.name.slice(0, 10)}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Render selected view */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8 text-purple-600" />}
          title="No study tasks found"
          description="Adjust your filters, search queries, or run the smart study planner generator."
        />
      ) : viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
              <span className="h-2 w-2 rounded-full bg-zinc-400 shrink-0" />{' '}
              Backlog / To Do (
              {filteredTasks.filter((t) => t.status === 'TODO').length})
            </h4>
            <div className="space-y-3">
              {filteredTasks
                .filter((t) => t.status === 'TODO')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subjects={subjects}
                    onStart={() => editTask(task.id, { status: 'IN_PROGRESS' })}
                    onComplete={() => completeTask(task.id)}
                    onDuplicate={() => duplicateTask(task.id)}
                    onArchive={() => archiveTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
            </div>
          </div>

          {/* IN_PROGRESS Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" /> In
              Study Sessions (
              {filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length})
            </h4>
            <div className="space-y-3">
              {filteredTasks
                .filter((t) => t.status === 'IN_PROGRESS')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subjects={subjects}
                    onStart={null}
                    onComplete={() => completeTask(task.id)}
                    onDuplicate={() => duplicateTask(task.id)}
                    onArchive={() => archiveTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
            </div>
          </div>

          {/* COMPLETED Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />{' '}
              Finished Tasks (
              {filteredTasks.filter((t) => t.status === 'COMPLETED').length})
            </h4>
            <div className="space-y-3">
              {filteredTasks
                .filter((t) => t.status === 'COMPLETED')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subjects={subjects}
                    onStart={null}
                    onComplete={null}
                    onDuplicate={() => duplicateTask(task.id)}
                    onArchive={() => archiveTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : viewMode === 'LIST' ? (
        <Card className="border border-border">
          <CardContent className="p-0 text-xs divide-y divide-border/60">
            {filteredTasks.map((task) => {
              const subCode =
                subjects.find((s) => s.id === task.subjectId)?.code || 'Course';
              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-muted/5 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex gap-3 items-start pr-2">
                    <span
                      className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getStatusColor(task.status)} shrink-0`}
                    >
                      {task.status}
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground text-sm flex items-center gap-2">
                        {task.title}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${getPriorityColor(task.priority)} shrink-0`}
                        >
                          {task.priority}
                        </span>
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-3 text-[10px] text-muted-foreground font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {task.estimatedTime}{' '}
                          mins
                        </span>
                        <span className="flex items-center gap-1">
                          🗓 Due: {task.dueDate}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-purple-600">
                          <BookOpen className="h-3 w-3" /> {subCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 items-center shrink-0">
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600"
                        title="Mark Complete"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                      </button>
                    )}
                    <button
                      onClick={() => duplicateTask(task.id)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                      title="Duplicate"
                    >
                      <Copy className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => archiveTask(task.id)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                      title="Archive"
                    >
                      <Archive className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        /* Timeline View */
        <Card className="border border-border">
          <CardContent className="p-6 text-xs">
            <div className="relative border-l border-border pl-4 space-y-6">
              {filteredTasks
                .sort(
                  (a, b) =>
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                )
                .map((task) => {
                  const subCode =
                    subjects.find((s) => s.id === task.subjectId)?.code ||
                    'Course';
                  return (
                    <div key={task.id} className="relative">
                      {/* Timeline Node */}
                      <span className="absolute -left-6.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border">
                        <Clock className="h-3 w-3 text-purple-600" />
                      </span>

                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <p className="font-bold text-foreground text-sm flex items-center gap-2">
                              {task.title}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </span>
                            </p>
                            <p className="text-muted-foreground mt-0.5 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-purple-600">
                            🗓 Due: {task.dueDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {task.estimatedTime}{' '}
                            mins
                          </span>
                          <span className="flex items-center gap-1 text-purple-600">
                            <BookOpen className="h-3 w-3" /> {subCode}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded border text-[8px] font-bold ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: StudyTask;
  subjects: Subject[];
  onStart: (() => void) | null;
  onComplete: (() => void) | null;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  getPriorityColor: (p: TaskPriority) => string;
}

function TaskCard({
  task,
  subjects,
  onStart,
  onComplete,
  onDuplicate,
  onArchive,
  onDelete,
  getPriorityColor,
}: TaskCardProps) {
  const subCode =
    subjects.find((s) => s.id === task.subjectId)?.code || 'Course';

  return (
    <Card className="border border-border bg-card hover:border-purple-600/30 transition-all duration-300 shadow-2xs hover:shadow-xs">
      <CardContent className="p-3 text-xs space-y-2.5">
        <div className="flex justify-between items-start gap-3">
          <span
            className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${getPriorityColor(task.priority)} shrink-0`}
          >
            {task.priority}
          </span>
          <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 shrink-0">
            {subCode}
          </span>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-foreground text-sm leading-snug">
            {task.title}
          </p>
          <p className="text-[10px] text-muted-foreground leading-normal">
            {task.description}
          </p>
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground text-[8px] flex items-center gap-0.5"
              >
                <Tag className="h-2 w-2" /> {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground font-semibold">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {task.estimatedTime} mins
          </span>
          <span>🗓 Due: {task.dueDate}</span>
        </div>

        <div className="flex justify-end gap-1 border-t border-border/40 pt-2 shrink-0">
          {onStart && (
            <button
              onClick={onStart}
              className="p-1 rounded hover:bg-blue-500/10 text-blue-600"
              title="Start Studying"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          {onComplete && (
            <button
              onClick={onComplete}
              className="p-1 rounded hover:bg-emerald-500/10 text-emerald-600"
              title="Complete Task"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onDuplicate}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onArchive}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-rose-500/10 text-rose-500"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
