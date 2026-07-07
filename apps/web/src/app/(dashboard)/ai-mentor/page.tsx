'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Plus,
  Brain,
  History,
  Menu,
  X,
  FileText,
  HelpCircle,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  CheckCircle2,
  Bookmark,
  Mic,
  Volume2,
  Download,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiMentorMockStore } from '@/store/useAiMentorMockStore';
import { useFlashcardMockStore } from '@/store/useFlashcardMockStore';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useProgressMockStore } from '@/store/useProgressMockStore';
import { useVoiceAssistantMockStore } from '@/store/useVoiceAssistantMockStore';
import { AiService, AiServiceError } from '@/lib/ai/service';
import { PROMPT_TEMPLATES } from '@/lib/ai/templates';
import { aiCache } from '@/lib/ai/cache';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { PageHeader, EmptyState } from '@/components/common';
import { toast } from 'sonner';

type ActiveTab = 'CHAT' | 'FLASHCARDS' | 'QUIZ' | 'HELPER' | 'VOICE';

interface SimulatedFlashcard {
  front: string;
  back: string;
}

interface SimulatedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function AiMentorPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('CHAT');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Error simulation state
  const [simulateError, setSimulateError] = useState(false);

  // Stores
  const chatStore = useAiMentorMockStore();
  const flashcardStore = useFlashcardMockStore();
  const academicStore = useAcademicMockStore();
  const notesStore = useNotesMockStore();
  const progressStore = useProgressMockStore();
  const voiceStore = useVoiceAssistantMockStore();

  // AI Architecture states
  const [useCache, setUseCache] = useState(true);
  const [requestLogs, setRequestLogs] = useState<
    {
      id: string;
      action: string;
      prompt: string;
      cached: boolean;
      timestamp: string;
    }[]
  >([]);
  const [retryHandler, setRetryHandler] = useState<(() => void) | null>(null);

  // Chat Input states
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Flashcards Generator states
  const [fcSubjectId, setFcSubjectId] = useState('');
  const [fcTopicId, setFcTopicId] = useState('');
  const [fcCount, setFcCount] = useState(3);
  const [isGeneratingFc, setIsGeneratingFc] = useState(false);
  const [fcProgress, setFcProgress] = useState(0);
  const [fcProgressText, setFcProgressText] = useState('');
  const [generatedFc, setGeneratedFc] = useState<SimulatedFlashcard[]>([]);
  const [isSavedFc, setIsSavedFc] = useState(false);

  // Quiz Generator states
  const [quizSubjectId, setQuizSubjectId] = useState('');
  const [quizTopicId, setQuizTopicId] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizProgress, setQuizProgress] = useState(0);
  const [quizProgressText, setQuizProgressText] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState<SimulatedQuizQuestion[]>(
    []
  );
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(
    null
  );
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Helper States (Summary / Explanation / Suggestions)
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [noteSummary, setNoteSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [explainSubjectId, setExplainSubjectId] = useState('');
  const [explainTopicId, setExplainTopicId] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationContent, setExplanationContent] = useState<{
    el5: string;
    deepDive: string;
    analogy: string;
  } | null>(null);
  const [explainTab, setExplainTab] = useState<'EL5' | 'DEEP' | 'ANALOGY'>(
    'EL5'
  );

  // Voice Assistant states
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const [transcribeProgressText, setTranscribeProgressText] = useState('');
  const [editTranscriptText, setEditTranscriptText] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [voiceViewTab, setVoiceViewTab] = useState<'TEXT' | 'INSIGHTS'>('TEXT');
  const [completedActionItems, setCompletedActionItems] = useState<
    Record<string, boolean>
  >({});

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatSeconds = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeVoiceSession = useMemo(() => {
    return (
      voiceStore.history.find((s) => s.id === voiceStore.activeSessionId) ||
      null
    );
  }, [voiceStore.history, voiceStore.activeSessionId]);

  // Sync edit state when active session changes
  useEffect(() => {
    if (activeVoiceSession) {
      setEditTranscriptText(activeVoiceSession.transcript);
      setIsEditingTranscript(false);
    } else {
      setEditTranscriptText('');
    }
  }, [activeVoiceSession]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    recordingTimerRef.current = setInterval(() => {
      setRecordSeconds((p) => p + 1);
    }, 1000);
    toast.success('Simulated recording started');
  };

  const handleStopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);

    setIsTranscribing(true);
    setTranscribeProgress(15);
    setTranscribeProgressText('Simulating voice capture extraction...');
    setRetryHandler(() => () => handleStopRecording());

    try {
      if (simulateError) {
        throw new AiServiceError(
          'TIMEOUT',
          'Simulated API Service connection timeout.',
          504
        );
      }

      const stepTimer = setTimeout(() => {
        setTranscribeProgress(60);
        setTranscribeProgressText('Translating voice transcription nodes...');
      }, 350);

      const prompt = `Transcribe study recording audio of duration ${recordSeconds} seconds.`;
      const isCached = useCache && !!aiCache.get(prompt);

      const res = await AiService.generateText(
        { prompt },
        { provider: 'mock', enableCache: useCache }
      );

      clearTimeout(stepTimer);
      setTranscribeProgress(100);
      setTranscribeProgressText('Success');
      setIsTranscribing(false);

      const durationStr = formatSeconds(recordSeconds);

      voiceStore.addSession({
        title: `Voice Session: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        duration: durationStr,
        transcript: res.text,
        summary:
          'Review of network interface layers, slow-start states, and congestion window growth limits.',
        keyPoints: [
          'Slow start phase increases congestion window exponentially.',
          'ssthresh state sets the boundary threshold for transition to linear growth.',
          'Congestion avoidance takes over once ssthresh limit is reached.',
        ],
        actionItems: [
          'Practice mapping network TCP window congestion charts.',
          'Add congestion avoidance flashcard recall queries.',
        ],
      });

      logAiRequest('Voice Summary', prompt, isCached);
      toast.success('Audio transcribed and saved successfully!');
      setRetryHandler(null);
    } catch (err) {
      setIsTranscribing(false);
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`AI Error: ${message}`);
    }
  };

  const handleSaveTranscriptEdits = () => {
    if (voiceStore.activeSessionId && editTranscriptText.trim()) {
      voiceStore.updateSessionTranscript(
        voiceStore.activeSessionId,
        editTranscriptText
      );
      setIsEditingTranscript(false);
      toast.success('Transcript edits saved successfully');
    }
  };

  const toggleActionItem = (itemText: string) => {
    setCompletedActionItems((prev) => ({
      ...prev,
      [itemText]: !prev[itemText],
    }));
  };

  const handleDownloadTranscript = (text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'voice_session_transcript.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Transcript downloaded as text file');
  };

  const activeConversation = chatStore.conversations.find(
    (c) => c.id === chatStore.activeConversationId
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Preset dropdowns to first available values if exist
    if (academicStore.subjects.length > 0 && academicStore.subjects[0]) {
      const firstSubId = academicStore.subjects[0].id;
      setFcSubjectId(firstSubId);
      setQuizSubjectId(firstSubId);
      setExplainSubjectId(firstSubId);
    }
  }, [academicStore.subjects]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping, streamedText]);

  // Sync topics when subjects change
  const filteredFcTopics = useMemo(() => {
    const subjectUnitIds = academicStore.units
      .filter((u) => u.subjectId === fcSubjectId)
      .map((u) => u.id);
    return academicStore.topics.filter((t) =>
      subjectUnitIds.includes(t.unitId)
    );
  }, [academicStore.topics, academicStore.units, fcSubjectId]);

  useEffect(() => {
    if (filteredFcTopics.length > 0 && filteredFcTopics[0]) {
      setFcTopicId(filteredFcTopics[0].id);
    } else {
      setFcTopicId('');
    }
  }, [fcSubjectId, filteredFcTopics]);

  const filteredQuizTopics = useMemo(() => {
    const subjectUnitIds = academicStore.units
      .filter((u) => u.subjectId === quizSubjectId)
      .map((u) => u.id);
    return academicStore.topics.filter((t) =>
      subjectUnitIds.includes(t.unitId)
    );
  }, [academicStore.topics, academicStore.units, quizSubjectId]);

  useEffect(() => {
    if (filteredQuizTopics.length > 0 && filteredQuizTopics[0]) {
      setQuizTopicId(filteredQuizTopics[0].id);
    } else {
      setQuizTopicId('');
    }
  }, [quizSubjectId, filteredQuizTopics]);

  const filteredExplainTopics = useMemo(() => {
    const subjectUnitIds = academicStore.units
      .filter((u) => u.subjectId === explainSubjectId)
      .map((u) => u.id);
    return academicStore.topics.filter((t) =>
      subjectUnitIds.includes(t.unitId)
    );
  }, [academicStore.topics, academicStore.units, explainSubjectId]);

  useEffect(() => {
    if (filteredExplainTopics.length > 0 && filteredExplainTopics[0]) {
      setExplainTopicId(filteredExplainTopics[0].id);
    } else {
      setExplainTopicId('');
    }
  }, [explainSubjectId, filteredExplainTopics]);

  // Auto-fill selected note details
  useEffect(() => {
    if (notesStore.notes.length > 0 && notesStore.notes[0]) {
      setSelectedNoteId(notesStore.notes[0].id);
    }
  }, [notesStore.notes]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Markdown parsing for bot responses
  const parseMarkdownToHtml = (text: string) => {
    if (!text) return '';
    const parts = text.split('```');
    return parts
      .map((part, idx) => {
        if (idx % 2 === 1) {
          const lines = part.split('\n');
          const lang = lines[0]?.trim() || 'typescript';
          const code = lines.slice(1).join('\n').trim();
          return `
            <div class="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
              <div class="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase font-bold">
                <span>${lang}</span>
              </div>
              <pre class="p-3 overflow-x-auto text-xs font-mono text-zinc-100 leading-relaxed"><code>${code}</code></pre>
            </div>
          `;
        }

        return part
          .split('\n')
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('### ')) {
              return `<h4 class="text-sm font-extrabold text-foreground mt-3 mb-1">${trimmed.slice(4)}</h4>`;
            }
            if (trimmed.startsWith('## ')) {
              return `<h3 class="text-base font-bold text-foreground mt-3 mb-1.5">${trimmed.slice(3)}</h3>`;
            }
            if (trimmed.startsWith('# ')) {
              return `<h2 class="text-lg font-extrabold text-foreground mt-4 mb-2 border-b border-border pb-1">${trimmed.slice(2)}</h2>`;
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return `<li class="ml-4 list-disc text-muted-foreground my-0.5">${trimmed.slice(2)}</li>`;
            }
            if (trimmed.startsWith('1. ')) {
              return `<li class="ml-4 list-decimal text-muted-foreground my-0.5">${trimmed.slice(3)}</li>`;
            }
            if (trimmed === '') return '<div class="h-2"></div>';

            const boldParsed = trimmed.replace(
              /\*\*(.*?)\*\*/g,
              '<strong>$1</strong>'
            );
            return `<p class="text-muted-foreground leading-normal my-1">${boldParsed}</p>`;
          })
          .join('');
      })
      .join('');
  };

  // AI Request log helper
  const logAiRequest = (action: string, prompt: string, cached: boolean) => {
    const newEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      prompt: prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt,
      cached,
      timestamp: new Date().toLocaleTimeString(),
    };
    setRequestLogs((prev) => [newEntry, ...prev.slice(0, 9)]);
  };

  // Chat actions
  const handleSendChat = async (text: string) => {
    if (!text.trim() || !chatStore.activeConversationId) return;

    chatStore.addMessage(chatStore.activeConversationId, 'user', text);
    setChatInput('');
    setIsTyping(true);
    setRetryHandler(() => () => handleSendChat(text));

    try {
      if (simulateError) {
        throw new AiServiceError(
          'TIMEOUT',
          'Simulated API Service connection timeout.',
          504
        );
      }

      const isCached = useCache && !!aiCache.get(text);

      let streamOutput = '';
      setIsTyping(false);
      setIsStreaming(true);
      setStreamedText('');

      await AiService.generateStream(
        { prompt: text },
        (chunk) => {
          streamOutput += chunk.text;
          setStreamedText(streamOutput);
        },
        { provider: 'mock', enableCache: useCache }
      );

      setIsStreaming(false);
      chatStore.addMessage(
        chatStore.activeConversationId,
        'assistant',
        streamOutput
      );
      setStreamedText('');
      logAiRequest('Tutor Chat', text, isCached);
      setRetryHandler(null);
    } catch (err) {
      setIsTyping(false);
      setIsStreaming(false);
      setStreamedText('');
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`AI Error: ${message}`);
    }
  };

  const handleRegenerateChat = async () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const lastUser = [...activeConversation.messages]
      .reverse()
      .find((m) => m.sender === 'user');

    if (lastUser) {
      setIsTyping(true);
      setRetryHandler(() => () => handleRegenerateChat());

      try {
        if (simulateError) {
          throw new AiServiceError(
            'TIMEOUT',
            'Simulated API Service connection timeout.',
            504
          );
        }

        const isCached = useCache && !!aiCache.get(lastUser.content);

        let streamOutput = '';
        setIsTyping(false);
        setIsStreaming(true);
        setStreamedText('');

        await AiService.generateStream(
          { prompt: lastUser.content },
          (chunk) => {
            streamOutput += chunk.text;
            setStreamedText(streamOutput);
          },
          { provider: 'mock', enableCache: useCache }
        );

        setIsStreaming(false);
        chatStore.addMessage(activeConversation.id, 'assistant', streamOutput);
        setStreamedText('');
        logAiRequest('Regenerate Chat', lastUser.content, isCached);
        setRetryHandler(null);
      } catch (err) {
        setIsTyping(false);
        setIsStreaming(false);
        setStreamedText('');
        const message =
          err instanceof Error ? err.message : 'An unknown error occurred.';
        toast.error(`AI Error: ${message}`);
      }
    }
  };

  // AI Flashcards Generator Logic
  const handleGenerateFlashcards = async () => {
    if (!fcSubjectId || !fcTopicId) {
      toast.error('Please select both a subject and a topic');
      return;
    }

    const sub = academicStore.subjects.find((s) => s.id === fcSubjectId);
    const top = academicStore.topics.find((t) => t.id === fcTopicId);
    const subName = sub ? sub.name : 'Computer Science';
    const topName = top ? top.title : 'General Study';

    setIsGeneratingFc(true);
    setFcProgress(15);
    setFcProgressText('Constructing query context...');
    setIsSavedFc(false);
    setGeneratedFc([]);
    setRetryHandler(() => () => handleGenerateFlashcards());

    try {
      if (simulateError) {
        throw new AiServiceError(
          'TIMEOUT',
          'Simulated API Service connection timeout.',
          504
        );
      }

      const stepTimer = setTimeout(() => {
        setFcProgress(50);
        setFcProgressText('Compiling schemas patterns...');
      }, 300);

      const prompt = PROMPT_TEMPLATES.generateFlashcards(
        subName,
        topName,
        fcCount
      );
      const isCached = useCache && !!aiCache.get(prompt);

      const res = await AiService.generateText(
        { prompt },
        { provider: 'mock', enableCache: useCache }
      );

      clearTimeout(stepTimer);
      setFcProgress(100);
      setFcProgressText('Success');
      setIsGeneratingFc(false);

      const parsedCards = JSON.parse(res.text) as SimulatedFlashcard[];
      setGeneratedFc(parsedCards);
      logAiRequest('Flashcard Gen', prompt, isCached);
      toast.success(`Successfully generated ${parsedCards.length} flashcards!`);
      setRetryHandler(null);
    } catch (err) {
      setIsGeneratingFc(false);
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`AI Error: ${message}`);
    }
  };

  const handleSaveFlashcards = () => {
    if (generatedFc.length === 0) return;

    // Find if a matching deck exists or add a new one
    const sub = academicStore.subjects.find((s) => s.id === fcSubjectId);
    const top = academicStore.topics.find((t) => t.id === fcTopicId);
    const deckName = `AI Deck: ${top ? top.title : sub ? sub.name : 'Study Session'}`;

    let deckId = flashcardStore.decks.find((d) => d.name === deckName)?.id;
    if (!deckId) {
      deckId = flashcardStore.addDeck({
        name: deckName,
        description: `Simulated AI auto-generated cards for subject topics.`,
      });
    }

    generatedFc.forEach((card) => {
      if (deckId) {
        flashcardStore.addFlashcard({
          deckId,
          front: card.front,
          back: card.back,
          difficulty: 'MEDIUM',
        });
      }
    });

    setIsSavedFc(true);
    toast.success(`Saved all generated cards to deck "${deckName}"!`);
  };

  // AI Quiz Generator Logic
  const handleGenerateQuiz = async () => {
    if (!quizSubjectId || !quizTopicId) {
      toast.error('Select both a subject and a topic to generate');
      return;
    }

    const sub = academicStore.subjects.find((s) => s.id === quizSubjectId);
    const top = academicStore.topics.find((t) => t.id === quizTopicId);
    const subName = sub ? sub.name : 'Computer Science';
    const topName = top ? top.title : 'General Study';

    setIsGeneratingQuiz(true);
    setQuizProgress(15);
    setQuizProgressText('Compiling CS test bank items...');
    setQuizComplete(false);
    setGeneratedQuiz([]);
    setActiveQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setRetryHandler(() => () => handleGenerateQuiz());

    try {
      if (simulateError) {
        throw new AiServiceError(
          'TIMEOUT',
          'Simulated API Service connection timeout.',
          504
        );
      }

      const stepTimer = setTimeout(() => {
        setQuizProgress(50);
        setQuizProgressText('Formulating distractor keys...');
      }, 300);

      const prompt = PROMPT_TEMPLATES.generateQuiz(subName, topName, 3);
      const isCached = useCache && !!aiCache.get(prompt);

      const res = await AiService.generateText(
        { prompt },
        { provider: 'mock', enableCache: useCache }
      );

      clearTimeout(stepTimer);
      setQuizProgress(100);
      setQuizProgressText('Success');
      setIsGeneratingQuiz(false);

      const parsedQuiz = JSON.parse(res.text) as SimulatedQuizQuestion[];
      setGeneratedQuiz(parsedQuiz);
      logAiRequest('Quiz Gen', prompt, isCached);
      toast.success('AI Interactive Quiz Generated!');
      setRetryHandler(null);
    } catch (err) {
      setIsGeneratingQuiz(false);
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`AI Error: ${message}`);
    }
  };

  const handleSelectQuizOption = (option: string) => {
    if (selectedQuizOption !== null) return; // Answer locked
    setSelectedQuizOption(option);
    const correct = option === generatedQuiz[activeQuizIndex]?.correctAnswer;
    if (correct) {
      setQuizScore((prev) => prev + 1);
      toast.success('Correct answer!');
    } else {
      toast.error('Incorrect answer.');
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOption(null);
    if (activeQuizIndex < generatedQuiz.length - 1) {
      setActiveQuizIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
      const scorePercentage = Math.round(
        (quizScore / generatedQuiz.length) * 100
      );
      const top = academicStore.topics.find((t) => t.id === quizTopicId);
      if (top) {
        progressStore.logUnderstandingUpdated(top.title, scorePercentage);
      }
    }
  };

  // AI Notes Summary Logic
  const handleSummarizeNote = async () => {
    if (!selectedNoteId) {
      toast.error('Select a study note to summarize');
      return;
    }
    const note = notesStore.notes.find((n) => n.id === selectedNoteId);
    if (!note) return;

    setIsSummarizing(true);
    setNoteSummary(null);
    setRetryHandler(() => () => handleSummarizeNote());

    try {
      if (simulateError) {
        throw new AiServiceError(
          'TIMEOUT',
          'Simulated API Service connection timeout.',
          504
        );
      }

      const prompt = PROMPT_TEMPLATES.summarizeNotes(
        note.title,
        note.content || ''
      );
      const isCached = useCache && !!aiCache.get(prompt);

      const res = await AiService.generateText(
        { prompt },
        { provider: 'mock', enableCache: useCache }
      );

      setIsSummarizing(false);
      setNoteSummary(res.text);
      logAiRequest('Note Summary', prompt, isCached);
      toast.success('Summary generated successfully!');
      setRetryHandler(null);
    } catch (err) {
      setIsSummarizing(false);
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`AI Error: ${message}`);
    }
  };

  const handleSaveSummaryToResources = () => {
    if (!noteSummary) return;
    const note = notesStore.notes.find((n) => n.id === selectedNoteId);
    notesStore.addResource({
      title: `Summary Guide: ${note ? note.title : 'Study Note'}`,
      description: `AI Generated Summary sheet.\n\nTakeaways:\n- Mapped functional parameters\n- Critical study metrics`,
      category: 'WEBSITE',
      ...(note?.subjectId ? { subjectId: note.subjectId } : {}),
      ...(note?.topicId ? { topicId: note.topicId } : {}),
    });
    toast.success('Summary saved to Reference Resources!');
  };

  // AI Topic Explanation Logic
  const handleExplainTopic = async () => {
    if (!explainSubjectId || !explainTopicId) {
      toast.error('Select a subject and a topic to explain');
      return;
    }

    const targetTopic = academicStore.topics.find(
      (t) => t.id === explainTopicId
    );
    const topTitle = targetTopic ? targetTopic.title : 'General Concept';

    setIsExplaining(true);
    setExplanationContent(null);
    setRetryHandler(() => () => handleExplainTopic());

    try {
      if (simulateError) {
        throw new AiServiceError(
          'TIMEOUT',
          'Simulated API Service connection timeout.',
          504
        );
      }

      const promptEl5 = PROMPT_TEMPLATES.explainConcept(topTitle, 'simple');
      const promptDeep = PROMPT_TEMPLATES.explainConcept(topTitle, 'deep');
      const promptAnalogy = PROMPT_TEMPLATES.explainConcept(
        topTitle,
        'analogy'
      );

      const isCached = useCache && !!aiCache.get(promptEl5);

      const resEl5 = await AiService.generateText(
        { prompt: promptEl5 },
        { provider: 'mock', enableCache: useCache }
      );
      const resDeep = await AiService.generateText(
        { prompt: promptDeep },
        { provider: 'mock', enableCache: useCache }
      );
      const resAnalogy = await AiService.generateText(
        { prompt: promptAnalogy },
        { provider: 'mock', enableCache: useCache }
      );

      setIsExplaining(false);
      setExplanationContent({
        el5: resEl5.text,
        deepDive: resDeep.text,
        analogy: resAnalogy.text,
      });

      logAiRequest('Concept Explainer', promptEl5, isCached);
      toast.success(`Concept explanation loaded for: ${topTitle}`);
      setRetryHandler(null);
    } catch (err) {
      setIsExplaining(false);
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`AI Error: ${message}`);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="AI Study Assistant"
          subtitle="Simulated tutor, flashcard generator, and summary hub."
        />
        <div className="h-64 border border-border bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <PageHeader
        title="AI Mentor Workspace"
        subtitle="Simulate AI study chat sessions, flashcard deck creation, interactive quizzes, and summaries."
        actions={
          <div className="flex items-center gap-4 bg-muted/40 px-3.5 py-1.5 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Simulate API Errors:
              </span>
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-input text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Use cache layer:
              </span>
              <input
                type="checkbox"
                checked={useCache}
                onChange={(e) => setUseCache(e.target.checked)}
                className="rounded border-input text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
            </div>
          </div>
        }
      />

      {/* Tabs list selector */}
      <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border text-xs font-bold select-none max-w-2xl">
        {[
          { id: 'CHAT', label: 'Tutor Chat' },
          { id: 'FLASHCARDS', label: 'Flashcard Gen' },
          { id: 'QUIZ', label: 'Quiz Simulator' },
          { id: 'HELPER', label: 'AI Helper Hub' },
          { id: 'VOICE', label: 'Voice Assistant' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Retry warnings alert */}
      {retryHandler && (
        <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-xl flex items-center justify-between text-xs max-w-2xl">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            Last AI task failed. Click retry to run again.
          </span>
          <Button
            size="xs"
            onClick={() => retryHandler()}
            className="bg-red-600 hover:bg-red-700 text-white gap-1 text-[10px] h-7"
          >
            <RotateCw className="h-3 w-3" /> Retry Request
          </Button>
        </div>
      )}

      {/* Telemetry Log panel */}
      {requestLogs.length > 0 && (
        <div className="p-4 border border-border bg-card/65 rounded-xl space-y-2.5 max-w-5xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <History className="h-3.5 w-3.5 text-purple-600" /> Recent AI
            Request Telemetry Logs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {requestLogs.map((log) => (
              <div
                key={log.id}
                className="p-2 border border-border bg-muted/20 rounded-lg text-[10px] leading-normal flex items-start justify-between"
              >
                <div>
                  <p className="font-bold text-foreground">{log.action}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                    {log.prompt}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      log.cached
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-purple-500/10 text-purple-600'
                    }`}
                  >
                    {log.cached ? 'Cache Hit' : 'API Request'}
                  </span>
                  <p className="text-[8px] text-muted-foreground mt-1 font-mono">
                    {log.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* TAB 1: AI Chat Tutor */}
        {activeTab === 'CHAT' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex h-[550px] border border-border bg-card rounded-2xl overflow-hidden relative"
          >
            {/* Sidebar mobile toggle */}
            <div className="absolute top-4 left-4 z-20 md:hidden">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Past history sidebar */}
            <div
              className={`w-56 bg-muted/20 border-r border-border flex flex-col justify-between absolute md:relative inset-y-0 left-0 z-10 transition-transform duration-300 md:translate-x-0 ${
                sidebarOpen
                  ? 'translate-x-0 bg-background md:bg-muted/20'
                  : '-translate-x-full'
              }`}
            >
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <History className="h-3 w-3" /> Past Chats
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      const newId = chatStore.createNewConversation();
                      chatStore.setActiveConversationId(newId);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {chatStore.conversations.map((conv) => {
                    const isActive = conv.id === chatStore.activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          chatStore.setActiveConversationId(conv.id);
                          setSidebarOpen(false);
                        }}
                        className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer ${
                          isActive
                            ? 'bg-purple-500/10 text-foreground font-bold'
                            : 'text-muted-foreground hover:bg-muted/5'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5 max-w-[130px]">
                          <MessageSquare className="h-3 w-3" />
                          {conv.title}
                        </span>
                        <X
                          className="h-3 w-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            chatStore.deleteConversation(conv.id);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chat viewport */}
            <div className="flex-1 flex flex-col justify-between bg-card min-w-0">
              <div className="p-4 border-b border-border pl-14 md:pl-4">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-purple-600" />
                  {activeConversation
                    ? activeConversation.title
                    : 'AI Mentor Chat'}
                </h3>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!activeConversation ||
                activeConversation.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-3">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    <p className="text-xs font-bold text-foreground">
                      Explain concept queries
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Type keywords like &quot;Big O&quot; or &quot;Normal
                      forms&quot; to verify simulated replies.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-2xl mx-auto text-xs">
                    {activeConversation.messages.map((msg) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed border relative group ${
                              isUser
                                ? 'bg-purple-600 text-white border-purple-600 rounded-br-xs'
                                : 'bg-muted/40 text-foreground border-border rounded-bl-xs'
                            }`}
                          >
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none text-xs"
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdownToHtml(msg.content),
                              }}
                            />

                            <div className="flex justify-between items-center gap-4 mt-2 border-t border-white/10 dark:border-border/40 pt-1.5 text-[9px] opacity-70">
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                              {!isUser && (
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      handleCopy(msg.content, msg.id)
                                    }
                                    title="Copy Response"
                                  >
                                    {copiedId === msg.id ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={handleRegenerateChat}
                                    title="Regenerate Response"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isStreaming && (
                      <div className="flex gap-3.5 justify-start">
                        <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed bg-muted/40 text-foreground border border-border rounded-bl-xs">
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-xs"
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdownToHtml(streamedText),
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {isTyping && (
                      <div className="flex gap-3.5 justify-start">
                        <div className="bg-muted/40 border border-border rounded-xl rounded-bl-xs px-3.5 py-2 flex items-center space-x-1">
                          <div
                            className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              {activeConversation && (
                <div className="p-4 border-t border-border shrink-0 bg-card">
                  <div className="max-w-2xl mx-auto flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI Tutor a question..."
                      className="flex-1 h-9 rounded-lg border border-input bg-transparent px-3 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSendChat(chatInput)
                      }
                    />
                    <Button
                      onClick={() => handleSendChat(chatInput)}
                      className="bg-purple-600 text-white h-9"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: AI Flashcard Generator */}
        {activeTab === 'FLASHCARDS' && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Input Config Form */}
            <Card className="lg:col-span-1 border border-border">
              <CardHeader>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Flashcard Generator
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Select Subject
                  </label>
                  <select
                    value={fcSubjectId}
                    onChange={(e) => setFcSubjectId(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  >
                    <option value="" disabled>
                      Choose Subject
                    </option>
                    {academicStore.subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Select Topic Connection
                  </label>
                  <select
                    value={fcTopicId}
                    onChange={(e) => setFcTopicId(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  >
                    <option value="" disabled>
                      Choose Topic
                    </option>
                    {filteredFcTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Number of Cards ({fcCount})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={fcCount}
                    onChange={(e) => setFcCount(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <Button
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFc}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs gap-1.5"
                >
                  {isGeneratingFc ? (
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate Flashcards
                </Button>
              </CardContent>
            </Card>

            {/* Generation Results view */}
            <div className="lg:col-span-2 space-y-4">
              {isGeneratingFc ? (
                <Card className="border border-border p-6 text-center space-y-4">
                  <CardContent className="space-y-2 pt-4">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${fcProgress}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-foreground animate-pulse">
                      {fcProgressText}
                    </p>
                  </CardContent>
                </Card>
              ) : generatedFc.length === 0 ? (
                <EmptyState
                  icon={<Brain className="h-8 w-8" />}
                  title="Flashcard Deck Generator"
                  description="Select a subject topic in the configurations panel and generate mock study flashcards."
                />
              ) : (
                <Card className="border border-border">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        Generated Flashcards
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Generated by AI simulation layers
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(generatedFc, null, 2),
                            'copy_json'
                          )
                        }
                        className="text-[10px] h-7 gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy Cards
                      </Button>
                      <Button
                        disabled={isSavedFc}
                        onClick={handleSaveFlashcards}
                        size="xs"
                        className="bg-purple-600 text-white text-[10px] h-7 gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {isSavedFc ? 'Saved to Decks' : 'Save to Decks'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2 text-xs">
                    {generatedFc.map((card, i) => (
                      <div
                        key={i}
                        className="p-3 border border-border bg-card/65 rounded-xl space-y-1.5"
                      >
                        <div className="flex items-start gap-1">
                          <span className="font-bold text-purple-600 shrink-0 select-none">
                            Q:
                          </span>
                          <p className="text-foreground font-semibold">
                            {card.front}
                          </p>
                        </div>
                        <div className="flex items-start gap-1 pt-1 border-t border-border/40">
                          <span className="font-bold text-emerald-600 shrink-0 select-none">
                            A:
                          </span>
                          <p className="text-muted-foreground">{card.back}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: AI Quiz Simulator */}
        {activeTab === 'QUIZ' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <Card className="lg:col-span-1 border border-border h-fit">
              <CardHeader>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-purple-600" />
                  Quiz Generator
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Select Subject
                  </label>
                  <select
                    value={quizSubjectId}
                    onChange={(e) => setQuizSubjectId(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  >
                    <option value="" disabled>
                      Choose Subject
                    </option>
                    {academicStore.subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Select Topic Connection
                  </label>
                  <select
                    value={quizTopicId}
                    onChange={(e) => setQuizTopicId(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  >
                    <option value="" disabled>
                      Choose Topic
                    </option>
                    {filteredQuizTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs gap-1.5"
                >
                  {isGeneratingQuiz ? (
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Generate AI Quiz
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              {isGeneratingQuiz ? (
                <Card className="border border-border p-6 text-center space-y-4">
                  <CardContent className="space-y-2 pt-4">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${quizProgress}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-foreground animate-pulse">
                      {quizProgressText}
                    </p>
                  </CardContent>
                </Card>
              ) : generatedQuiz.length === 0 ? (
                <EmptyState
                  icon={<HelpCircle className="h-8 w-8" />}
                  title="AI Quiz Simulator"
                  description="Generate interactive multiple-choice quizzes to test your understanding."
                />
              ) : quizComplete ? (
                <Card className="border border-border p-6 text-center space-y-4">
                  <CardContent className="space-y-3 pt-4 text-xs">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                    <h3 className="text-base font-bold text-foreground">
                      Quiz Session Complete!
                    </h3>
                    <p className="text-muted-foreground">
                      You scored{' '}
                      <strong className="text-purple-600">
                        {quizScore} / {generatedQuiz.length}
                      </strong>{' '}
                      correct answers!
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      This quiz attempt has been auto-logged to your academic
                      progress files and logged in your activity history log.
                    </p>
                    <Button
                      onClick={() => setGeneratedQuiz([])}
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs"
                    >
                      Reset Generator
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-border">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        Question {activeQuizIndex + 1} of {generatedQuiz.length}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Choose the correct answer below
                      </p>
                    </div>
                    <span className="text-xs font-bold text-purple-600">
                      Score: {quizScore}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-xs">
                    <p className="font-semibold text-foreground text-sm leading-relaxed">
                      {generatedQuiz[activeQuizIndex]?.question}
                    </p>

                    <div className="space-y-2">
                      {generatedQuiz[activeQuizIndex]?.options.map((opt) => {
                        const isSelected = selectedQuizOption === opt;
                        const isCorrect =
                          opt === generatedQuiz[activeQuizIndex]?.correctAnswer;
                        let optionClass = 'border-border hover:bg-muted/10';

                        if (selectedQuizOption !== null) {
                          if (isCorrect)
                            optionClass =
                              'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold';
                          else if (isSelected)
                            optionClass =
                              'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400';
                        }

                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelectQuizOption(opt)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex justify-between items-center ${optionClass}`}
                          >
                            <span>{opt}</span>
                            {selectedQuizOption !== null && isCorrect && (
                              <Check className="h-4 w-4 text-emerald-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedQuizOption !== null && (
                      <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-1">
                        <p className="font-bold text-[10px] text-purple-600 uppercase">
                          AI Explanation:
                        </p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {generatedQuiz[activeQuizIndex]?.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 border-t border-border bg-muted/10 flex justify-end px-4 py-2">
                    <Button
                      onClick={handleNextQuizQuestion}
                      disabled={selectedQuizOption === null}
                      className="bg-purple-600 text-white text-xs h-8 gap-1"
                    >
                      {activeQuizIndex === generatedQuiz.length - 1
                        ? 'Finish Quiz'
                        : 'Next Question'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: AI Helper Hub */}
        {activeTab === 'HELPER' && (
          <motion.div
            key="helper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Row 1: Notes Summarizer & Explainer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notes summary tool */}
              <Card className="border border-border flex flex-col justify-between">
                <CardHeader>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-purple-600" />
                    AI Notes Summarizer
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3 text-xs flex-1">
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground">
                      Select Note Entry
                    </label>
                    <select
                      value={selectedNoteId}
                      onChange={(e) => {
                        setSelectedNoteId(e.target.value);
                        setNoteSummary(null);
                      }}
                      className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs dark:bg-zinc-900"
                    >
                      <option value="" disabled>
                        Choose Note
                      </option>
                      {notesStore.notes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleSummarizeNote}
                    disabled={isSummarizing || !selectedNoteId}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs gap-1.5 mt-2"
                  >
                    {isSummarizing ? (
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Summarize Study Note
                  </Button>

                  {noteSummary && (
                    <div className="border border-border bg-card/65 p-3 rounded-lg space-y-3 mt-3 relative group">
                      <button
                        onClick={() => handleCopy(noteSummary, 'summary_copy')}
                        className="absolute top-2 right-2 p-1 hover:text-purple-600 text-muted-foreground"
                      >
                        {copiedId === 'summary_copy' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-[11px] leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdownToHtml(noteSummary),
                        }}
                      />
                      <Button
                        onClick={handleSaveSummaryToResources}
                        variant="outline"
                        size="xs"
                        className="text-[9px] h-6 px-2 text-purple-600 gap-1.5"
                      >
                        <Bookmark className="h-3 w-3" /> Save to Resources
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Explainer Panel */}
              <Card className="border border-border flex flex-col justify-between">
                <CardHeader>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-purple-600" />
                    AI Concept Explainer
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3 text-xs flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground">
                        Subject
                      </label>
                      <select
                        value={explainSubjectId}
                        onChange={(e) => setExplainSubjectId(e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs dark:bg-zinc-900"
                      >
                        <option value="" disabled>
                          Choose Subject
                        </option>
                        {academicStore.subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground">
                        Topic
                      </label>
                      <select
                        value={explainTopicId}
                        onChange={(e) => {
                          setExplainTopicId(e.target.value);
                          setExplanationContent(null);
                        }}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs dark:bg-zinc-900"
                      >
                        <option value="" disabled>
                          Choose Topic
                        </option>
                        {filteredExplainTopics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleExplainTopic}
                    disabled={isExplaining || !explainTopicId}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs gap-1.5 mt-2"
                  >
                    {isExplaining ? (
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Brain className="h-3.5 w-3.5" />
                    )}
                    Explain Topic Concepts
                  </Button>

                  {explanationContent && (
                    <div className="border border-border bg-card/65 rounded-lg overflow-hidden mt-3 text-xs flex-1 flex flex-col justify-between min-h-[150px]">
                      <div className="flex border-b border-border bg-muted/40 text-[10px] select-none shrink-0 font-bold">
                        <button
                          onClick={() => setExplainTab('EL5')}
                          className={`px-3 py-1.5 transition-colors border-r border-border ${
                            explainTab === 'EL5'
                              ? 'bg-card text-purple-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Simple (EL5)
                        </button>
                        <button
                          onClick={() => setExplainTab('DEEP')}
                          className={`px-3 py-1.5 transition-colors border-r border-border ${
                            explainTab === 'DEEP'
                              ? 'bg-card text-purple-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Deep Dive
                        </button>
                        <button
                          onClick={() => setExplainTab('ANALOGY')}
                          className={`px-3 py-1.5 transition-colors ${
                            explainTab === 'ANALOGY'
                              ? 'bg-card text-purple-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Analogy
                        </button>
                      </div>

                      <div className="p-3 text-[11px] leading-relaxed text-muted-foreground">
                        {explainTab === 'EL5' && (
                          <p>{explanationContent.el5}</p>
                        )}
                        {explainTab === 'DEEP' && (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdownToHtml(
                                explanationContent.deepDive
                              ),
                            }}
                          />
                        )}
                        {explainTab === 'ANALOGY' && (
                          <p>{explanationContent.analogy}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Row 2: AI Weak Topics & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weak topics card */}
              <Card className="lg:col-span-1 border border-border">
                <CardHeader>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    AI Weak Topics Mappings
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3 text-xs pt-2">
                  <p className="text-[10px] text-muted-foreground">
                    Based on mock study score records
                  </p>

                  <div className="space-y-2">
                    <div className="p-2 border border-border bg-card/65 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          Relational Algebra Joins
                        </p>
                        <p className="text-[9px] text-red-500">
                          Understanding: 40%
                        </p>
                      </div>
                      <Button
                        size="xs"
                        onClick={() => {
                          setActiveTab('QUIZ');
                          setQuizSubjectId('sub-2'); // SQL/DB subject ID
                        }}
                        className="bg-purple-600 text-white text-[9px] h-6"
                      >
                        Quiz Me
                      </Button>
                    </div>

                    <div className="p-2 border border-border bg-card/65 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          Binary Tree Traversals
                        </p>
                        <p className="text-[9px] text-red-500">
                          Understanding: 55%
                        </p>
                      </div>
                      <Button
                        size="xs"
                        onClick={() => {
                          setActiveTab('FLASHCARDS');
                          setFcSubjectId('sub-1'); // DSA subject ID
                        }}
                        className="bg-purple-600 text-white text-[9px] h-6"
                      >
                        Generate Cards
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Recommendations cards */}
              <Card className="lg:col-span-2 border border-border">
                <CardHeader>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Personalized AI Suggestions
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4 pt-2 text-xs">
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="p-3 border border-border bg-purple-500/5 rounded-xl space-y-1.5">
                      <h4 className="font-bold text-purple-600 flex items-center gap-1">
                        <Brain className="h-3.5 w-3.5" /> Spaced Repetition Due
                      </h4>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        You have **3 cards** due for review today. Keep your
                        streak active by finishing them!
                      </p>
                    </div>

                    <div className="p-3 border border-border bg-amber-500/5 rounded-xl space-y-1.5">
                      <h4 className="font-bold text-amber-600 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> High Anomaly Risk
                      </h4>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Let&apos;s do a quiz attempt! Normalization anomalies
                        violated criteria in employees table.
                      </p>
                    </div>
                  </div>

                  {/* Subject summary cards */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      Subject AI Summaries
                    </p>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <div className="p-3 border border-border bg-card/65 rounded-xl space-y-1 text-[11px]">
                        <p className="font-bold text-foreground">
                          Data Structures & Algorithms
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          Focus on graph shortest paths and complexity classes
                          calculations. Pinned notes exist.
                        </p>
                      </div>
                      <div className="p-3 border border-border bg-card/65 rounded-xl space-y-1 text-[11px]">
                        <p className="font-bold text-foreground">
                          Database Management Systems
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          Avoid transitive anomalies. Practice BCNF partitioning
                          schemas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 5: AI Voice Assistant */}
        {activeTab === 'VOICE' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Sidebar: recorder and past logs */}
            <div className="lg:col-span-1 space-y-6">
              {/* Simulated Audio Recorder */}
              <Card className="border border-border">
                <CardHeader>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Mic className="h-4 w-4 text-purple-600" />
                    Recording Studio
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-center flex flex-col items-center justify-center pt-2">
                  {isRecording ? (
                    <div className="space-y-4 w-full flex flex-col items-center">
                      {/* Bouncing Waveform animation */}
                      <div className="flex items-center justify-center gap-1 h-12 w-full max-w-[180px]">
                        {[
                          0.4, 0.9, 0.5, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.3,
                          0.6,
                        ].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 bg-purple-600 rounded-full"
                            animate={{ height: [10, h * 40, 10] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: i * 0.05,
                            }}
                          />
                        ))}
                      </div>

                      <div className="space-y-1">
                        <span className="text-lg font-mono font-bold text-foreground">
                          {formatSeconds(recordSeconds)}
                        </span>
                        <p className="text-[10px] text-muted-foreground animate-pulse">
                          Capturing simulated voice streams...
                        </p>
                      </div>

                      <Button
                        onClick={handleStopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 h-10 w-10 flex items-center justify-center"
                        title="Stop Recording"
                      >
                        <Square className="h-4 w-4 fill-white" />
                      </Button>
                    </div>
                  ) : isTranscribing ? (
                    <div className="space-y-3 w-full py-4 text-center">
                      <RotateCw className="h-6 w-6 text-purple-600 animate-spin mx-auto" />
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden max-w-[200px] mx-auto">
                          <div
                            className="h-full bg-purple-600 transition-all duration-300"
                            style={{ width: `${transcribeProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-foreground animate-pulse">
                          {transcribeProgressText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4 text-center">
                      <div className="p-3 bg-purple-600/10 rounded-full w-fit mx-auto">
                        <Mic className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Simulate speaking study notes out loud to transcribe key
                        points.
                      </p>
                      <Button
                        onClick={handleStartRecording}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 gap-1.5"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" /> Start
                        Recording
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Voice Logs History */}
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <h3 className="font-bold text-xs text-muted-foreground tracking-wide uppercase">
                    Past Voice Notes ({voiceStore.history.length})
                  </h3>
                </CardHeader>
                <CardContent className="space-y-2 pt-2 text-xs">
                  {voiceStore.history.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6 italic">
                      No voice sessions logged.
                    </p>
                  ) : (
                    voiceStore.history.map((session) => {
                      const isActive =
                        session.id === voiceStore.activeSessionId;
                      return (
                        <div
                          key={session.id}
                          onClick={() =>
                            voiceStore.setActiveSessionId(session.id)
                          }
                          className={`group flex items-start justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-purple-500/10 border-purple-600/30 text-foreground font-bold'
                              : 'border-transparent bg-transparent hover:bg-muted/10 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-0.5">
                              <span className="bg-muted px-1 py-0.2 rounded-sm font-semibold">
                                {session.duration}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  session.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              voiceStore.deleteSession(session.id);
                              toast.success('Voice session deleted');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 ml-2"
                            title="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Active transcription notes inspector */}
            <div className="lg:col-span-2">
              {activeVoiceSession ? (
                <Card className="border border-border h-full flex flex-col justify-between">
                  <CardHeader className="pb-2 border-b border-border bg-muted/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <Volume2 className="h-4 w-4 text-purple-600 animate-pulse" />
                          {activeVoiceSession.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Recorded{' '}
                          {new Date(
                            activeVoiceSession.createdAt
                          ).toLocaleString()}{' '}
                          | Duration: {activeVoiceSession.duration}
                        </p>
                      </div>

                      {/* Tab toggles */}
                      <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border text-[10px] font-bold select-none shrink-0 self-start sm:self-center">
                        <button
                          onClick={() => setVoiceViewTab('TEXT')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            voiceViewTab === 'TEXT'
                              ? 'bg-card text-foreground shadow-2xs'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Transcript
                        </button>
                        <button
                          onClick={() => setVoiceViewTab('INSIGHTS')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            voiceViewTab === 'INSIGHTS'
                              ? 'bg-card text-foreground shadow-2xs'
                              : 'text-muted-foreground'
                          }`}
                        >
                          AI Insights
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-xs leading-relaxed">
                    {voiceViewTab === 'TEXT' ? (
                      /* Transcript Editor viewport */
                      <div className="space-y-4 flex flex-col h-full">
                        <div className="flex justify-between items-center bg-muted/20 p-2 border border-border rounded-lg text-[10px] font-bold text-muted-foreground">
                          <span>Study speech transcript contents</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleDownloadTranscript(
                                  activeVoiceSession.transcript
                                )
                              }
                              className="hover:text-purple-600 flex items-center gap-1"
                              title="Download Transcript"
                            >
                              <Download className="h-3.5 w-3.5" /> Download
                            </button>
                            <span>|</span>
                            <button
                              onClick={() =>
                                handleCopy(
                                  activeVoiceSession.transcript,
                                  'voice_copy'
                                )
                              }
                              className="hover:text-purple-600 flex items-center gap-1"
                              title="Copy Transcript"
                            >
                              {copiedId === 'voice_copy' ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}{' '}
                              Copy
                            </button>
                          </div>
                        </div>

                        {isEditingTranscript ? (
                          <div className="space-y-3">
                            <textarea
                              value={editTranscriptText}
                              onChange={(e) =>
                                setEditTranscriptText(e.target.value)
                              }
                              rows={8}
                              className="w-full flex rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingTranscript(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-purple-600 text-white"
                                onClick={handleSaveTranscriptEdits}
                              >
                                Save Edits
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-4 border border-border bg-card/65 rounded-xl text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {activeVoiceSession.transcript}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 h-8 text-[11px]"
                              onClick={() => setIsEditingTranscript(true)}
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit Transcript
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* AI Insights viewport: Summary, Keypoints, Action checkboxes */
                      <div className="space-y-6">
                        {/* Summary takeaway */}
                        <div className="p-3 border border-purple-500/15 bg-purple-500/5 rounded-xl space-y-1.5">
                          <h4 className="font-bold text-purple-600 text-[10px] uppercase flex items-center gap-1">
                            <Brain className="h-3.5 w-3.5" /> AI Summary
                            Takeaways
                          </h4>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {activeVoiceSession.summary}
                          </p>
                        </div>

                        {/* Key points extraction */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-[10px] text-foreground uppercase tracking-wider">
                            Key Points Extracted
                          </h4>
                          <ul className="space-y-1.5 list-disc ml-4 text-muted-foreground text-[11px]">
                            {activeVoiceSession.keyPoints.map(
                              (point, index) => (
                                <li key={index}>{point}</li>
                              )
                            )}
                          </ul>
                        </div>

                        {/* Action checklists */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-[10px] text-foreground uppercase tracking-wider">
                            Simulated Action Checklist
                          </h4>
                          <div className="space-y-1.5 pt-1">
                            {activeVoiceSession.actionItems.map(
                              (item, index) => {
                                const isChecked = !!completedActionItems[item];
                                return (
                                  <div
                                    key={index}
                                    onClick={() => toggleActionItem(item)}
                                    className="flex items-center gap-2 p-2 border border-border bg-card/65 hover:bg-muted/5 rounded-lg cursor-pointer select-none text-[11px]"
                                  >
                                    <button className="text-purple-600 shrink-0">
                                      {isChecked ? (
                                        <CheckSquare className="h-4 w-4 fill-purple-500/10" />
                                      ) : (
                                        <Square className="h-4 w-4" />
                                      )}
                                    </button>
                                    <span
                                      className={`text-muted-foreground ${isChecked ? 'line-through opacity-60' : ''}`}
                                    >
                                      {item}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  icon={<Mic className="h-8 w-8" />}
                  title="Voice Study Assistant"
                  description="Capture study audio, transcribe speech into notes, extract checklists, and review takeaways."
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
