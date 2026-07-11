'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  RotateCw,
  CheckCircle,
  HelpCircle,
  FileText,
  Bookmark,
  Layers,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState } from '@/components/common';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useQuizMockStore } from '@/store/useQuizMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { useRecommendationMockStore } from '@/store/useRecommendationMockStore';
import {
  RecommendationEngine,
  RecommendationPriority,
  RecommendationCategory,
} from '@aelpt/shared';

export default function RecommendationsPage() {
  // Stores
  const { subjects, units, topics } = useAcademicMockStore();
  const { notes, resources } = useNotesMockStore();
  const { history: quizHistory } = useQuizMockStore();
  const { streakCount, logTopicCompleted } = useProgressMockStore();
  const { flashcards } = useFlashcardMockStore();

  const {
    suggestions,
    dailyPlan,
    dismissedIds,
    completedIds,
    setRecommendations,
    dismissRecommendation,
    completeRecommendation,
    setRefreshing,
    isRefreshing,
  } = useRecommendationMockStore();

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  const [isPending, startTransition] = useTransition();

  // Auto generate recommendations on mount if empty
  useEffect(() => {
    if (suggestions.length === 0 && subjects.length > 0) {
      handleRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    startTransition(() => {
      try {
        const payload = RecommendationEngine.generateRecommendations({
          topics,
          subjects,
          units,
          notes,
          resources,
          flashcards,
          quizHistory,
          streakCount,
        });
        setRecommendations(payload);
        toast.success('AI recommendations updated successfully!');
      } catch (err) {
        console.error('Failed to generate recommendations:', err);
        toast.error('An error occurred while compiling study guides.');
      } finally {
        setRefreshing(false);
      }
    });
  };

  const getPriorityColor = (priority: RecommendationPriority) => {
    if (priority === 'HIGH')
      return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    if (priority === 'MEDIUM')
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
  };

  const getCategoryIcon = (category: RecommendationCategory) => {
    if (category === 'REVIEW_FLASHCARDS')
      return <Layers className="h-4 w-4 text-purple-500" />;
    if (category === 'PRACTICE_QUIZ')
      return <HelpCircle className="h-4 w-4 text-emerald-500" />;
    if (category === 'READ_NOTE')
      return <FileText className="h-4 w-4 text-blue-500" />;
    return <Bookmark className="h-4 w-4 text-amber-500" />;
  };

  // Filter recommendations list
  const activeSuggestions = suggestions.filter((sug) => {
    if (dismissedIds.includes(sug.id)) return false;
    if (completedIds.includes(sug.id)) return false;

    if (priorityFilter !== 'ALL' && sug.priority !== priorityFilter)
      return false;
    if (categoryFilter !== 'ALL' && sug.category !== categoryFilter)
      return false;
    if (subjectFilter !== 'ALL' && sug.relatedSubjectId !== subjectFilter)
      return false;

    return true;
  });

  const dismissedSuggestions = suggestions.filter((sug) =>
    dismissedIds.includes(sug.id)
  );
  const completedSuggestions = suggestions.filter((sug) =>
    completedIds.includes(sug.id)
  );

  // Extract separate recommendations by category
  const suggestedFlashcardRecs = activeSuggestions.filter(
    (s) => s.category === 'REVIEW_FLASHCARDS'
  );
  const suggestedQuizRecs = activeSuggestions.filter(
    (s) =>
      s.category === 'PRACTICE_QUIZ' || s.category === 'IMPROVE_WEAK_CONCEPT'
  );
  const suggestedResourceRecs = activeSuggestions.filter(
    (s) => s.category === 'READ_NOTE' || s.category === 'REVISE_UNIT'
  );
  const weakTopicRecs = activeSuggestions.filter(
    (s) => s.reason === 'LOW_UNDERSTANDING' || s.reason === 'QUIZ_FAILED'
  );

  const totalHighPriority = activeSuggestions.filter(
    (s) => s.priority === 'HIGH'
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Study Guide & Recommendations"
        subtitle="Intelligent context-aware study goals and semantic resources compiled from your academic profile."
        actions={
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isPending || subjects.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 gap-1.5"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isRefreshing || isPending ? 'animate-spin' : ''}`}
            />
            Refresh Recommendations
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-purple-600" />}
          title="No course details found"
          description="Add semesters and subjects in the academic console to initialize recommendation indexes."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT: Daily Study Plan & overview metrics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overview stats */}
            <Card className="border border-border">
              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-foreground">
                      AI Study Guide
                    </h4>
                    <p className="text-muted-foreground mt-0.5">
                      Scans 8 metrics deterministically
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-3 space-y-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Est. study load:
                    </span>
                    <span className="text-foreground font-bold">
                      {dailyPlan?.estimatedMinutes || 0} mins
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" /> Study Streak:
                    </span>
                    <span className="text-foreground font-bold">
                      {streakCount} days
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground flex items-center gap-1">
                      🚨 High Priority tasks:
                    </span>
                    <span className="text-rose-500 font-bold">
                      {totalHighPriority} items
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily study goals Checklist */}
            {dailyPlan && (
              <Card className="border border-border bg-gradient-to-br from-purple-500/5 to-transparent">
                <CardHeader className="pb-1.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-purple-600" /> Daily
                    study plan
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3 text-xs pt-1.5">
                  {dailyPlan.dailyGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2.5 items-start p-2 border rounded bg-card/60"
                    >
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-purple-600/10 text-purple-600 font-extrabold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed text-foreground">
                        {goal}
                      </span>
                    </div>
                  ))}

                  {dailyPlan.revisionReminders.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                      <p className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wide">
                        Reminders:
                      </p>
                      {dailyPlan.revisionReminders.map((rem, idx) => (
                        <p
                          key={idx}
                          className="text-[10px] text-muted-foreground leading-normal"
                        >
                          ⚠️ {rem}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: Recommendations Lists & Tabs */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters Row */}
            <Card className="border border-border">
              <CardContent className="p-3 flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase tracking-wider">
                  <SlidersHorizontal className="h-4 w-4 text-purple-600" />{' '}
                  Filters:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {/* Priority Filter */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus:outline-hidden"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus:outline-hidden"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="STUDY_TOPIC">Study Topics</option>
                    <option value="REVIEW_FLASHCARDS">Flashcards</option>
                    <option value="PRACTICE_QUIZ">Quizzes</option>
                    <option value="READ_NOTE">Study Notes</option>
                  </select>

                  {/* Subject Filter */}
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
                </div>
              </CardContent>
            </Card>

            {/* List Suggestions */}
            {activeSuggestions.length > 0 ? (
              <div className="space-y-4">
                {activeSuggestions.map((sug) => (
                  <Card
                    key={sug.id}
                    className="border border-border hover:border-purple-600/30 transition-all duration-300 shadow-2xs hover:shadow-xs"
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
                      <div className="flex gap-3 items-start pr-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground mt-0.5">
                          {getCategoryIcon(sug.category)}
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-extrabold text-sm text-foreground">
                              {sug.title}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase shrink-0 ${getPriorityColor(sug.priority)}`}
                            >
                              {sug.priority}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[8px] bg-purple-500/10 text-purple-600 font-extrabold uppercase shrink-0">
                              {Math.round(sug.confidence * 100)}% confidence
                            </span>
                          </div>

                          <p className="text-muted-foreground leading-relaxed">
                            {sug.description}
                          </p>

                          {sug.sourceReference && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block pt-1">
                              Reference: {sug.sourceReference}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => dismissRecommendation(sug.id)}
                          className="px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-rose-500 transition-colors hover:bg-rose-500/5 font-semibold"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            completeRecommendation(sug.id);
                            logTopicCompleted(
                              `Completed recommendation task: "${sug.title}"`
                            );
                            toast.success(
                              `Completed recommendation: "${sug.title}"`
                            );
                          }}
                          className="px-2.5 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-8 w-8 text-purple-600" />}
                title="All suggestions clear"
                description="No active recommendations matched your filters. Check back later or adjust category rules."
              />
            )}

            {/* Categorized Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Weak Areas list */}
              <Card className="border border-border">
                <CardHeader className="pb-1.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    🚨 Identified Weak Topics
                  </h3>
                </CardHeader>
                <CardContent className="pt-1.5 space-y-2 text-xs">
                  {weakTopicRecs.length > 0 ? (
                    weakTopicRecs.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="p-2 border border-border/40 rounded bg-card hover:bg-muted/10 transition-colors flex justify-between gap-4"
                      >
                        <span className="font-semibold text-foreground truncate">
                          {r.title
                            .replace('Study weak topic: ', '')
                            .replace('Re-evaluate concepts: ', '')}
                        </span>
                        <span className="text-rose-500 font-extrabold shrink-0">
                          Priority: {r.score}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No weak topics index warning active.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resource & notes Suggestions */}
              <Card className="border border-border">
                <CardHeader className="pb-1.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    📚 Recommended Reading references
                  </h3>
                </CardHeader>
                <CardContent className="pt-1.5 space-y-2 text-xs">
                  {suggestedResourceRecs.length > 0 ? (
                    suggestedResourceRecs.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="p-2 border border-border/40 rounded bg-card hover:bg-muted/10 transition-colors flex justify-between gap-4"
                      >
                        <span className="font-semibold text-foreground truncate">
                          {r.title
                            .replace('Revise: ', '')
                            .replace('Examine reference material: ', '')}
                        </span>
                        <span className="text-blue-500 font-bold shrink-0">
                          {r.sourceReference}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No notes study suggestions.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quizzes & Flashcards suggested columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Suggested Practice Quizzes */}
              <Card className="border border-border">
                <CardHeader className="pb-1.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    ✍️ Suggested Practice Quizzes
                  </h3>
                </CardHeader>
                <CardContent className="pt-1.5 space-y-2 text-xs">
                  {suggestedQuizRecs.length > 0 ? (
                    suggestedQuizRecs.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="p-2 border border-border/40 rounded bg-card hover:bg-muted/10 transition-colors flex justify-between gap-4"
                      >
                        <span className="font-semibold text-foreground truncate">
                          {r.title}
                        </span>
                        <span className="text-emerald-500 font-bold shrink-0">
                          Practice
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No quiz recommendations.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Overdue card queues */}
              <Card className="border border-border">
                <CardHeader className="pb-1.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    🗂️ Suggested Flashcard Decks
                  </h3>
                </CardHeader>
                <CardContent className="pt-1.5 space-y-2 text-xs">
                  {suggestedFlashcardRecs.length > 0 ? (
                    suggestedFlashcardRecs.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="p-2 border border-border/40 rounded bg-card hover:bg-muted/10 transition-colors flex justify-between gap-4"
                      >
                        <span className="font-semibold text-foreground truncate">
                          {r.title}
                        </span>
                        <span className="text-purple-500 font-bold shrink-0">
                          {r.sourceReference}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No due flashcard decks recommendation.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* History attempts/Dismissed lists */}
            {(completedSuggestions.length > 0 ||
              dismissedSuggestions.length > 0) && (
              <Card className="border border-border">
                <CardHeader className="pb-1.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Completed & Inactive Suggestions
                  </h3>
                </CardHeader>
                <CardContent className="pt-1.5 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Completed */}
                    <div className="space-y-1.5">
                      <p className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wide">
                        Recently Completed:
                      </p>
                      {completedSuggestions.length > 0 ? (
                        completedSuggestions.slice(0, 5).map((s) => (
                          <p
                            key={s.id}
                            className="text-green-600 font-medium truncate"
                          >
                            ✓ {s.title}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-[10px]">
                          No completed recommendation tasks.
                        </p>
                      )}
                    </div>

                    {/* Dismissed */}
                    <div className="space-y-1.5">
                      <p className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wide">
                        Dismissed Suggestions:
                      </p>
                      {dismissedSuggestions.length > 0 ? (
                        dismissedSuggestions.slice(0, 5).map((s) => (
                          <p
                            key={s.id}
                            className="text-muted-foreground truncate line-through"
                          >
                            {s.title}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-[10px]">
                          No dismissed suggestions.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
