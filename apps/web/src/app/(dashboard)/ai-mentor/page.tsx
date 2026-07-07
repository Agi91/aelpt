'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
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
} from 'lucide-react';
import { useAiMentorMockStore } from '@/store/useAiMentorMockStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/common';
import { toast } from 'sonner';

export default function AiMentorPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Store state
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    addMessage,
    clearConversation,
    deleteConversation,
  } = useAiMentorMockStore();

  // Input states
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping, streamedText]);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="AI Mentor"
          subtitle="Personalized study companion and tutor."
        />
        <div className="h-64 border border-border bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Helper: Markdown-to-HTML parser for chatbot messages
  const parseMarkdownToHtml = (text: string) => {
    if (!text) return '';

    // Split code blocks out to render them properly
    const parts = text.split('```');
    return parts
      .map((part, idx) => {
        // Odd indexes are code blocks
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

        // Even indexes are regular markdown text
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

  // Rule-based simulated AI replies
  const generateSimulatedReply = (query: string): string => {
    const lower = query.toLowerCase();

    if (
      lower.includes('big o') ||
      lower.includes('complexity') ||
      lower.includes('algorithm')
    ) {
      return `Big O complexity refers to the rate at which an algorithm's running time or memory usage grows relative to the input size $N$. 

Here are the most common complexity classes:
- **O(1) Constant**: The operation takes a fixed amount of time. E.g., looking up array elements.
- **O(log N) Logarithmic**: Divides the input size in half repeatedly. E.g., Binary Search.
- **O(N) Linear**: Time scales proportionally with the input size. E.g., single loop iterations.
- **O(N log N) Linearithmic**: Typical of optimal sorting algorithms.
\`\`\`typescript
// Merge Sort divides array and merges in linear time: O(N log N)
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
\`\`\``;
    }

    if (
      lower.includes('normal form') ||
      lower.includes('3nf') ||
      lower.includes('dbms') ||
      lower.includes('database')
    ) {
      return `In Database Management Systems, Normalization forms reduce data redundancy and anomalies:

- **1NF (First Normal Form)**: Atomic values, no repeating groups.
- **2NF (Second Normal Form)**: In 1NF and no partial dependencies (non-key attributes depend on the full primary key).
- **3NF (Third Normal Form)**: In 2NF and no transitive dependencies.

Example transitive anomaly violation:
\`\`\`sql
-- Violation: DepartmentName depends on DepartmentID which depends on EmployeeID
CREATE TABLE Employee (
  EmployeeID INT PRIMARY KEY,
  DepartmentID INT,
  DepartmentName VARCHAR(100) -- Transitive dependency!
);
\`\`\``;
    }

    if (
      lower.includes('quiz') ||
      lower.includes('test') ||
      lower.includes('practice')
    ) {
      return `Here is a quiz question on Computer Science concepts to test your understanding:

### Question:
Which of the following is true regarding **3NF**?
- [A] It allows transitive dependencies for primary keys.
- [B] It must satisfy the criteria for 2NF and contain zero transitive functional dependencies of non-prime attributes on candidate keys.
- [C] It requires columns to have multiple multivalued sets.
- [D] It does not require tables to satisfy 1NF.

*Reply with your answer (A, B, C, or D) to receive feedback!*`;
    }

    if (
      lower.includes('summarize') ||
      lower.includes('summary') ||
      lower.includes('notes')
    ) {
      return `Here is a summarized cohort map of your active study notes:

1. **TCP/IP OSI Architecture**:
   - OSI Reference Model maps 7 theoretical layers (MAC, IP, Transport, presentation, etc).
   - TCP/IP represents 4 functional layers that govern today's internet packet exchanges.

2. **Quicksort Algorithm**:
   - Pivot split selection dictates performance ($O(N^2)$ worst case, $O(N \\log N)$ optimal average).
   - Auxiliary call stack space is $O(\\log N)$.`;
    }

    if (
      lower.includes('streak') ||
      lower.includes('study plan') ||
      lower.includes('calendar')
    ) {
      return `Your study progress looks excellent! Here is your AI Recommended Study Plan:

1. **Revision Due Today**: Review 10 Spaced Repetition flashcards. Focus on SM-2 hard cards.
2. **Database Unit Review**: Review transitive dependencies mock flashcards.
3. **Paging & Virtual Memory**: Read paging mechanism outline note templates.`;
    }

    if (lower.match(/^(a|b|c|d)$/)) {
      if (lower === 'b') {
        return `🎉 **Correct!** 

Option [B] is the definition of Third Normal Form (3NF). By eliminating transitive dependencies, we ensure database anomalies are prevented when updating records. Great work!`;
      }
      return `❌ **Incorrect.** 

Option [B] is the correct answer. 3NF requires the schema to be in 2NF and have no transitive dependencies of non-prime attributes on primary keys. Let me know if you would like a detailed explanation!`;
    }

    return `That is a great question! As your AI Mentor, I am trained to explain concepts, generate quick quizzes, organize study plans, or summarize your notes. 

Try clicking on any of the **Quick Actions** below or ask me to explain a specific topic!`;
  };

  // Streaming text simulation trigger
  const triggerStreamingResponse = (
    conversationId: string,
    replyText: string
  ) => {
    setIsStreaming(true);
    setStreamedText('');

    let index = 0;
    const interval = setInterval(() => {
      if (index < replyText.length) {
        setStreamedText((prev) => prev + replyText.charAt(index));
        index += 2;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        addMessage(conversationId, 'assistant', replyText);
        setStreamedText('');
      }
    }, 15);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || !activeConversationId) return;

    // Save user message in store
    addMessage(activeConversationId, 'user', textToSend);
    setInputValue('');

    // Trigger typing state
    setIsTyping(true);

    const reply = generateSimulatedReply(textToSend);

    setTimeout(() => {
      setIsTyping(false);
      triggerStreamingResponse(activeConversationId, reply);
    }, 1200);
  };

  const handleRegenerateResponse = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;

    // Find last user message
    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find((m) => m.sender === 'user');

    if (lastUserMessage) {
      setIsTyping(true);
      const reply = generateSimulatedReply(lastUserMessage.content);

      setTimeout(() => {
        setIsTyping(false);
        triggerStreamingResponse(activeConversation.id, reply);
      }, 1000);
    }
  };

  const handleCopyResponse = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    if (activeConversationId) {
      clearConversation(activeConversationId);
      toast.success('Conversation cleared');
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] border border-border bg-card rounded-2xl overflow-hidden relative">
      {/* SIDEBAR drawer toggle (Mobile/Tablet) */}
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

      {/* CONVERSATION HISTORY SIDEBAR */}
      <div
        className={`w-64 bg-muted/20 border-r border-border flex flex-col justify-between shrink-0 absolute md:relative inset-y-0 left-0 z-10 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0 bg-background md:bg-muted/20'
            : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Sessions
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                const newId = createNewConversation();
                setActiveConversationId(newId);
                toast.success('New session created');
              }}
              title="Create new conversation"
            >
              <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </Button>
          </div>

          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                    isActive
                      ? 'bg-purple-500/10 border-purple-600/20 text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:bg-muted/10 hover:text-foreground'
                  }`}
                >
                  <span className="truncate flex items-center gap-2 max-w-[150px]">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    {conv.title}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                      toast.success('Session deleted');
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0 transition-opacity p-0.5"
                    title="Delete session"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/40 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>AI Mentor Sandbox</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleClearChat}
            className="text-[10px] font-bold"
          >
            Reset Active
          </Button>
        </div>
      </div>

      {/* CHAT DISPLAY PANEL */}
      <div className="flex-1 flex flex-col justify-between bg-card min-w-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 pl-14 md:pl-4">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              {activeConversation
                ? activeConversation.title
                : 'No Session Selected'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Powered by simulated tutor intelligence
            </p>
          </div>

          {activeConversation && activeConversation.messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-xs text-destructive hover:text-destructive h-8 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Chat
            </Button>
          )}
        </div>

        {/* Conversation Message Logs */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            /* Empty Chat State - Prompts & Actions */
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto space-y-6 text-center">
              <div className="p-3 bg-purple-600/10 rounded-full">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  AI Mentor Companion
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Ask computer science queries, generate quick quizzes, draft
                  study timetables, or summarize your semester coursework.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 w-full pt-4">
                <Card
                  onClick={() => handleSendMessage('Summarize my study notes')}
                  className="p-3 border border-border bg-card/60 hover:bg-muted/10 cursor-pointer text-left space-y-1"
                >
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs font-bold text-foreground">
                    Summarize Notes
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Condensed summaries of files
                  </p>
                </Card>
                <Card
                  onClick={() =>
                    handleSendMessage('Give me a computer science quiz')
                  }
                  className="p-3 border border-border bg-card/60 hover:bg-muted/10 cursor-pointer text-left space-y-1"
                >
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-bold text-foreground">
                    CS Practice Quiz
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Test understanding points
                  </p>
                </Card>
                <Card
                  onClick={() =>
                    handleSendMessage('Create a revision study plan')
                  }
                  className="p-3 border border-border bg-card/60 hover:bg-muted/10 cursor-pointer text-left space-y-1"
                >
                  <Clock className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-bold text-foreground">
                    Generate Study Plan
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Spaced reviews recommendation
                  </p>
                </Card>
              </div>

              {/* Suggested Prompts list */}
              <div className="w-full text-left space-y-2 pt-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Suggested Queries
                </p>
                <div className="space-y-1.5">
                  {[
                    'Explain Big O time and space complexity models',
                    'Explain Third Normal Form (3NF) transitive dependencies',
                    'How does virtual memory paging work?',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-2 rounded-lg border border-border bg-card hover:bg-muted/5 text-xs text-muted-foreground hover:text-foreground flex items-center justify-between"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Render active conversation messages */
            <div className="space-y-4 max-w-3xl mx-auto">
              {activeConversation.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed relative group border ${
                        isUser
                          ? 'bg-purple-600 text-white border-purple-600 rounded-br-xs'
                          : 'bg-muted/40 text-foreground border-border rounded-bl-xs'
                      }`}
                    >
                      {/* Message Content */}
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-xs"
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdownToHtml(msg.content),
                        }}
                      />

                      {/* Footer: timestamp + copy/regenerate toolbars */}
                      <div className="flex items-center justify-between gap-4 mt-2 border-t border-white/10 dark:border-border/40 pt-1.5 text-[9px] opacity-70">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {!isUser && (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleCopyResponse(msg.id, msg.content)
                              }
                              className="hover:text-purple-600 transition-colors p-0.5"
                              title="Copy response"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={handleRegenerateResponse}
                              className="hover:text-purple-600 transition-colors p-0.5"
                              title="Regenerate reply"
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

              {/* Streaming Content Simulator */}
              {isStreaming && streamedText && (
                <div className="flex gap-3 justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed bg-muted/40 text-foreground border border-border rounded-bl-xs">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-xs"
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdownToHtml(streamedText),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Typing Indicator Animation */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-muted/40 border border-border rounded-2xl rounded-bl-xs px-4 py-3 flex items-center space-x-1">
                    <div
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Footer */}
        {activeConversation && (
          <div className="p-4 border-t border-border bg-card shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your AI Study Mentor a question..."
                className="flex-1 h-10 rounded-lg border border-input bg-transparent px-3 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSendMessage(inputValue)
                }
                disabled={isTyping || isStreaming}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                className="bg-purple-600 hover:bg-purple-700 text-white h-10 px-4"
                disabled={!inputValue.trim() || isTyping || isStreaming}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
