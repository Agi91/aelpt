'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  History,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Timer as TimerIcon,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState } from '@/components/common';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useQuizMockStore } from '@/store/useQuizMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { rebuildVectorIndex } from '@/lib/ai/vector-search-bridge';
import {
  Quiz,
  QuizResult,
  QuizAttempt,
  QuestionType,
  VectorSearchService,
} from '@aelpt/shared';
import { QuizGenerator } from '@aelpt/shared';

export default function QuizPage() {
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'HISTORY'>('BUILDER');

  // Stores
  const { semesters, subjects, units, topics } = useAcademicMockStore();
  const { notes, resources } = useNotesMockStore();
  const { history, saveQuizAttempt, clearQuizHistory } = useQuizMockStore();
  const { addStudyMinutes, logTopicCompleted } = useProgressMockStore();

  // Builder Config State
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
    'MEDIUM'
  );
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'MCQ',
    'TF',
    'FILL',
  ]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(0); // 0 = no limit

  // Running Session State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedAnswer
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [activeResult, setActiveResult] = useState<QuizResult | null>(null);

  // Transition & Search indexing references
  const [isPending, startTransition] = useTransition();
  const [searchService, setSearchService] =
    useState<VectorSearchService | null>(null);

  // Timers references
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Vector Search database
  useEffect(() => {
    const initSearch = async () => {
      try {
        const service = await rebuildVectorIndex();
        setSearchService(service);
      } catch (err) {
        console.error('Failed to initialize search service for quiz:', err);
      }
    };
    void initSearch();
  }, [notes, resources, topics]);

  // Session duration timer
  useEffect(() => {
    if (activeQuiz && !isSubmitted) {
      setElapsedSeconds(0);

      if (activeQuiz.timeLimit) {
        setTimeLeftSeconds(activeQuiz.timeLimit);
      } else {
        setTimeLeftSeconds(null);
      }

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        if (activeQuiz.timeLimit) {
          setTimeLeftSeconds((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              // Auto submit
              toast.warning('Time limit reached! Auto-submitting your quiz.');
              void handleAutoSubmit();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuiz, isSubmitted]);

  const handleToggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      } else {
        toast.error('Must select at least one question type.');
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleAutoSubmit = () => {
    setIsSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    calculateAndSaveResults();
  };

  const handleStartQuiz = () => {
    if (!searchService) {
      toast.error('Quiz database engine is compiling, please wait a moment.');
      return;
    }

    startTransition(async () => {
      try {
        // Step 1: Perform vector search query to retrieve relevant context
        const subject = subjects.find((s) => s.id === subjectId);
        const topic = topics.find((t) => t.id === topicId);
        const queryTerm =
          topic?.title || subject?.name || 'Computer Science Engineering';

        const contextResults = await searchService.search(
          queryTerm,
          {
            ...(semesterId ? { semesterId } : {}),
            ...(subjectId ? { subjectId } : {}),
            ...(unitId ? { unitId } : {}),
            ...(topicId ? { topicId } : {}),
          },
          15, // Retrieve top 15 chunks
          0.1 // Match threshold
        );

        // Step 2: Pass context to QuizGenerator
        const compiledQuiz = QuizGenerator.generateQuizFromContext(
          contextResults,
          {
            title: topic
              ? `Topic Quiz: ${topic.title}`
              : subject
                ? `Subject Quiz: ${subject.name}`
                : 'General Curriculum Quiz',
            numQuestions,
            difficulty,
            questionTypes: selectedTypes,
            ...(subjectId ? { subjectId } : {}),
            ...(topicId ? { topicId } : {}),
            ...(timeLimitMinutes > 0
              ? { timeLimit: timeLimitMinutes * 60 }
              : {}),
          }
        );

        // Step 3: Initialize session
        setActiveQuiz(compiledQuiz);
        setCurrentQuestionIdx(0);
        setAnswers({});
        setIsSubmitted(false);
        setShowReview(false);
        setActiveResult(null);
        toast.success(
          `Generated quiz containing ${compiledQuiz.questions.length} grounded questions!`
        );
      } catch (err) {
        console.error('Quiz creation failed:', err);
        toast.error('Failed to construct retrieval-augmented quiz questions.');
      }
    });
  };

  const calculateAndSaveResults = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const attempts: QuizAttempt[] = activeQuiz.questions.map((q) => {
      const selected = answers[q.id] || '';
      const isCorrect =
        selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (!selected.trim()) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect,
        timeSpent: Math.round(elapsedSeconds / activeQuiz.questions.length),
      };
    });

    const score = Math.round(
      (correctCount / activeQuiz.questions.length) * 100
    );
    const answeredCount = correctCount + wrongCount;
    const accuracy =
      answeredCount > 0
        ? Number((correctCount / answeredCount).toFixed(2))
        : 0.0;

    const topicTitle =
      topics.find((t) => t.id === activeQuiz.topicId)?.title ||
      'Curriculum Overview';

    const result: QuizResult = {
      quizId: activeQuiz.id,
      score,
      accuracy,
      timeTaken: elapsedSeconds,
      correctCount,
      wrongCount,
      skippedCount,
      attempts,
      summary: `You scored ${score}% accuracy by resolving ${correctCount} questions correctly.`,
      topicAnalysis: [
        {
          topicTitle,
          accuracy,
          ...(activeQuiz.topicId !== undefined
            ? { topicId: activeQuiz.topicId }
            : {}),
        },
      ],
      completedAt: new Date().toISOString(),
    };

    setActiveResult(result);
    saveQuizAttempt(activeQuiz, result);

    // Update Academic Progress logs
    addStudyMinutes(Math.max(1, Math.round(elapsedSeconds / 60)));
    logTopicCompleted(
      `Completed Interactive Quiz: ${activeQuiz.title} (Scored ${score}%)`
    );
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleSelectAnswer = (qId: string, value: string) => {
    setAnswers({
      ...answers,
      [qId]: value,
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Filter list helpers
  const filteredSubjects = semesterId
    ? subjects.filter((s) => s.semesterId === semesterId)
    : subjects;
  const filteredUnits = subjectId
    ? units.filter((u) => u.subjectId === subjectId)
    : units;
  const filteredTopics = unitId
    ? topics.filter((t) => t.unitId === unitId)
    : topics;

  // Render Quiz Running screen
  if (activeQuiz && !isSubmitted) {
    const currentQuestion = activeQuiz.questions[currentQuestionIdx];
    const isLastQuestion =
      currentQuestionIdx === activeQuiz.questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Session header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to exit the quiz? Progress will be lost.'
                )
              ) {
                setActiveQuiz(null);
              }
            }}
            className="text-xs gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Cancel Quiz
          </Button>

          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-muted/60 border px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1">
              <TimerIcon className="h-4 w-4 text-purple-600 animate-pulse" />
              Time Elapsed: {formatTime(elapsedSeconds)}
            </span>
            {timeLeftSeconds !== null && (
              <span
                className={`flex items-center gap-1 font-bold ${timeLeftSeconds < 30 ? 'text-red-500 animate-bounce' : 'text-foreground'}`}
              >
                Time Left: {formatTime(timeLeftSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-bold">
            <span>
              QUESTION {currentQuestionIdx + 1} OF {activeQuiz.questions.length}
            </span>
            <span>
              {Math.round(
                ((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Panel */}
        {currentQuestion && (
          <Card className="border border-border p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  {currentQuestion.type}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Weight: {currentQuestion.scoreWeight} points
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground leading-normal">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        handleSelectAnswer(currentQuestion.id, opt)
                      }
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all duration-300 flex items-center justify-between ${
                        answers[currentQuestion.id] === opt
                          ? 'border-purple-600 bg-purple-500/5 text-purple-700 dark:text-purple-400 ring-1 ring-purple-600/35'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                          answers[currentQuestion.id] === opt
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-muted'
                        }`}
                      >
                        {answers[currentQuestion.id] === opt && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'TF' && (
                <div className="grid grid-cols-2 gap-3">
                  {['True', 'False'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        handleSelectAnswer(currentQuestion.id, opt)
                      }
                      className={`p-4 rounded-xl border text-xs font-bold text-center transition-all duration-300 ${
                        answers[currentQuestion.id] === opt
                          ? 'border-purple-600 bg-purple-500/5 text-purple-700 dark:text-purple-400'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'FILL' && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-semibold">
                    Type your answer:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) =>
                      handleSelectAnswer(currentQuestion.id, e.target.value)
                    }
                    placeholder="Enter keywords or phrases..."
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-xs shadow-xs focus-visible:outline-hidden"
                  />
                </div>
              )}

              {currentQuestion.type === 'SHORT' && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-semibold">
                    Simulate short answer response:
                  </label>
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) =>
                      handleSelectAnswer(currentQuestion.id, e.target.value)
                    }
                    placeholder="Type details explanation summary..."
                    rows={4}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-xs shadow-xs focus-visible:outline-hidden"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Question controls */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            disabled={currentQuestionIdx === 0}
            onClick={handlePrevQuestion}
            className="text-xs h-9"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <Button
            variant="ghost"
            onClick={handleNextQuestion}
            disabled={isLastQuestion}
            className="text-xs h-9 text-muted-foreground hover:text-foreground"
          >
            Skip Question <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleAutoSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-5"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 px-5"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render Quiz Review Screen (If completed and in Review mode)
  if (activeQuiz && isSubmitted && showReview && activeResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReview(false)}
            className="text-xs gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Exit Review
          </Button>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Review: {activeQuiz.title}
          </span>
        </div>

        <div className="space-y-4">
          {activeQuiz.questions.map((q, idx) => {
            const attempt = activeResult.attempts.find(
              (a) => a.questionId === q.id
            );
            const userAns = attempt?.selectedAnswer || '(Skipped)';
            const isCorrect = attempt?.isCorrect || false;

            return (
              <Card
                key={q.id}
                className={`border p-5 space-y-3 shadow-2xs ${isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Question {idx + 1} ({q.type})
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <p className="text-xs font-bold text-foreground">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground block font-medium">
                      Your answer:
                    </span>
                    <span
                      className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {userAns}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">
                      Correct answer:
                    </span>
                    <span className="text-green-600 font-bold">
                      {q.correctAnswer}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/40 border p-3 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-muted-foreground">
                    Explanation:
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {q.explanation}
                  </p>
                  <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-2">
                    Source: {q.sourceReference}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Quiz Result Summary Screen
  if (activeQuiz && isSubmitted && activeResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border border-border p-6 text-center space-y-4">
          <div className="flex justify-center pt-2">
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                activeResult.score >= 70
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              <CheckCircle className="h-8 w-8" />
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">
              Quiz Session Complete!
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {activeQuiz.title}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 border-y border-border py-4 max-w-md mx-auto">
            <div className="text-center">
              <span className="block text-xl font-extrabold text-purple-600 dark:text-purple-400">
                {activeResult.score}%
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Score
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-extrabold text-foreground">
                {formatTime(activeResult.timeTaken)}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Time Taken
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-extrabold text-foreground">
                {Math.round(activeResult.accuracy * 100)}%
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Accuracy
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs max-w-md mx-auto pt-2">
            <div className="p-2 border rounded bg-green-500/5 text-green-600">
              <span className="font-bold text-sm block">
                {activeResult.correctCount}
              </span>{' '}
              Correct
            </div>
            <div className="p-2 border rounded bg-rose-500/5 text-rose-500">
              <span className="font-bold text-sm block">
                {activeResult.wrongCount}
              </span>{' '}
              Incorrect
            </div>
            <div className="p-2 border rounded bg-muted/60 text-muted-foreground">
              <span className="font-bold text-sm block">
                {activeResult.skippedCount}
              </span>{' '}
              Skipped
            </div>
          </div>

          <div className="flex gap-2.5 pt-4 justify-center">
            <Button
              onClick={() => {
                setActiveQuiz(null);
                handleStartQuiz();
              }}
              variant="outline"
              className="text-xs h-9 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-attempt
            </Button>
            <Button
              onClick={() => setShowReview(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9"
            >
              Review Questions
            </Button>
            <Button
              onClick={() => {
                setActiveQuiz(null);
                setActiveResult(null);
              }}
              variant="ghost"
              className="text-xs h-9"
            >
              Back to Builder
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Quiz Engine"
        subtitle="Test your comprehension using custom Retrieval-Augmented practice tests grounded in your uploaded resources and notes."
      />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border text-xs font-semibold select-none pb-0">
        <button
          onClick={() => setActiveTab('BUILDER')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'BUILDER'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Quiz Setup
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" /> Attempt History (
            {history.length})
          </span>
        </button>
      </div>

      {activeTab === 'BUILDER' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder parameters card */}
          <Card className="lg:col-span-2 border border-border h-fit">
            <CardHeader className="pb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-purple-600" /> Configure
                Parameters
              </h3>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Semester filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Semester:
                  </label>
                  <select
                    value={semesterId}
                    onChange={(e) => {
                      setSemesterId(e.target.value);
                      setSubjectId('');
                      setUnitId('');
                      setTopicId('');
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">Choose Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Subject:
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setUnitId('');
                      setTopicId('');
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">Choose Subject</option>
                    {filteredSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Unit:
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => {
                      setUnitId(e.target.value);
                      setTopicId('');
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">Choose Unit</option>
                    {filteredUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Topic:
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">Choose Topic</option>
                    {filteredTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
                {/* Number of Questions */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Question count:
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>

                {/* Difficulty level */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Difficulty:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as 'EASY' | 'MEDIUM' | 'HARD'
                      )
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                {/* Time Limit */}
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    Time Limit:
                  </label>
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) =>
                      setTimeLimitMinutes(parseInt(e.target.value))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value={0}>No limit</option>
                    <option value={2}>2 Minutes</option>
                    <option value={5}>5 Minutes</option>
                    <option value={10}>10 Minutes</option>
                    <option value={20}>20 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Question Types Checkboxes */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-muted-foreground font-semibold block">
                  Question formats:
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'MCQ', label: 'Multiple Choice (MCQ)' },
                    { key: 'TF', label: 'True / False' },
                    { key: 'FILL', label: 'Fill in the Blanks' },
                    { key: 'SHORT', label: 'Short Answer (Simulation)' },
                  ].map((format) => {
                    const isSelected = selectedTypes.includes(
                      format.key as QuestionType
                    );
                    return (
                      <button
                        key={format.key}
                        onClick={() =>
                          handleToggleQuestionType(format.key as QuestionType)
                        }
                        className={`flex items-center gap-2 border px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-500/5 text-purple-700 dark:text-purple-400'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center text-white ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-muted'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        {format.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleStartQuiz}
                  disabled={isPending || !subjectId}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 text-xs gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />{' '}
                  {isPending
                    ? 'Generating grounded questions...'
                    : 'Generate Retrieval-Augmented Quiz'}
                </Button>
                {!subjectId && (
                  <span className="text-[10px] text-rose-500 mt-1 block text-center">
                    * Please choose a subject to retrieve corresponding study
                    references.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines Sidebar info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-border p-4 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardContent className="space-y-4 pt-1 text-xs">
                <h4 className="font-extrabold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-purple-600" /> Grounded
                  Generation
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Unlike traditional generative quizzes, the AELPT Quiz engine
                  first searches your semantic database index (Note chunks,
                  Topic descriptors, Resource summaries) and extracts details to
                  ensure questions validate against actual study material.
                </p>
                <div className="p-3 bg-muted/60 border rounded-lg space-y-1.5">
                  <p className="font-bold text-muted-foreground">
                    Difficulty Weights:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Easy: 1x weight multipliers</li>
                    <li>Medium: 2x weight multipliers</li>
                    <li>Hard: 3x weight multipliers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Attempt History Panel */
        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {history.map((entry) => (
                <Card key={entry.id} className="border border-border">
                  <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">
                          {entry.quiz.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-muted font-bold text-muted-foreground">
                          {entry.quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Completed at:{' '}
                        {new Date(entry.completedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-base font-extrabold text-purple-600 dark:text-purple-400">
                          {entry.result.score}%
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Score
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-base font-bold text-foreground">
                          {Math.round(entry.result.accuracy * 100)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Accuracy
                        </span>
                      </div>

                      <div className="flex gap-1.5 ml-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setActiveQuiz(entry.quiz);
                            setIsSubmitted(true);
                            setActiveResult(entry.result);
                            setShowReview(true);
                          }}
                          className="h-7 text-[10px]"
                        >
                          Review
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => {
                            setActiveQuiz(entry.quiz);
                            setCurrentQuestionIdx(0);
                            setAnswers({});
                            setIsSubmitted(false);
                            setShowReview(false);
                            setActiveResult(null);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-[10px]"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => {
                    if (window.confirm('Delete all history attempts?')) {
                      clearQuizHistory();
                    }
                  }}
                  variant="ghost"
                  className="text-xs text-rose-500 hover:bg-transparent"
                >
                  Clear historical records
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<History className="h-8 w-8 text-muted-foreground" />}
              title="No previous quiz attempts"
              description="Configure parameters under Quiz Setup and complete a test to view historical performance insights here."
            />
          )}
        </div>
      )}
    </div>
  );
}
