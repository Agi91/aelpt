'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Plus,
  Search,
  Pin,
  Star,
  Trash2,
  BookOpen,
  FolderOpen,
  ChevronRight,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Code,
  Link,
  Clock,
  FileText,
  Archive,
  RefreshCw,
  PlusCircle,
  Tag,
  Key,
  Check,
} from 'lucide-react';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/common';
import { NoteForm } from '@/components/forms/NoteForm';
import { Note, CreateNoteInput } from '@aelpt/shared';
import { toast } from 'sonner';

type ViewMode = 'SPLIT' | 'EDITOR' | 'PREVIEW';
type NotesTab = 'ACTIVE' | 'ARCHIVED';

export default function NotesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('SPLIT');
  const [notesTab, setNotesTab] = useState<NotesTab>('ACTIVE');

  // Stores
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    toggleFavoriteNote,
    toggleArchiveNote,
    addNoteTags,
  } = useNotesMockStore();
  const { subjects, topics } = useAcademicMockStore();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');

  // Selected Note state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // Auto-save Status
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING' | 'IDLE'>(
    'SAVED'
  );
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tag manager state
  const [newTagInput, setNewTagInput] = useState('');

  // Dialogs
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter notes list
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        filterSubjectId === 'ALL' || n.subjectId === filterSubjectId;
      const matchesTab = notesTab === 'ACTIVE' ? !n.isArchived : n.isArchived;
      return matchesSearch && matchesSubject && matchesTab;
    });
  }, [notes, searchQuery, filterSubjectId, notesTab]);

  // Sort notes: pinned ones go first
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredNotes]);

  const selectedNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  // Sync selected note content to editor state
  useEffect(() => {
    if (selectedNote) {
      setNoteContent(selectedNote.content);
      setNoteTitle(selectedNote.title);
      setSaveStatus('SAVED');
    } else {
      setNoteContent('');
      setNoteTitle('');
    }
  }, [selectedNoteId, selectedNote]);

  // Load first note by default on tabs toggle
  useEffect(() => {
    if (sortedNotes.length > 0 && sortedNotes[0]) {
      setSelectedNoteId(sortedNotes[0].id);
    } else {
      setSelectedNoteId(null);
    }
  }, [notesTab, filterSubjectId, sortedNotes]);

  // Auto-save simulation handler
  const handleContentChange = useCallback(
    (val: string) => {
      setNoteContent(val);
      setSaveStatus('SAVING');

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        if (selectedNoteId) {
          updateNote(selectedNoteId, { content: val });
          setSaveStatus('SAVED');
          setLastSavedTime(
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      }, 800);
    },
    [selectedNoteId, updateNote]
  );

  const handleTitleChange = useCallback(
    (val: string) => {
      setNoteTitle(val);
      setSaveStatus('SAVING');

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        if (selectedNoteId) {
          updateNote(selectedNoteId, { title: val });
          setSaveStatus('SAVED');
          setLastSavedTime(
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      }, 800);
    },
    [selectedNoteId, updateNote]
  );

  // Markdown editor toolbar helpers
  const insertMarkdown = useCallback(
    (syntax: 'bold' | 'italic' | 'h1' | 'h2' | 'list' | 'code' | 'link') => {
      const textarea = document.getElementById(
        'note-workspace-textarea'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const selected = text.substring(start, end);

      let inserted = '';
      let cursorOffset = 0;

      if (syntax === 'bold') {
        inserted = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? inserted.length : 2;
      } else if (syntax === 'italic') {
        inserted = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? inserted.length : 1;
      } else if (syntax === 'h1') {
        inserted = `\n# ${selected || 'Heading 1'}\n`;
        cursorOffset = inserted.length - 1;
      } else if (syntax === 'h2') {
        inserted = `\n## ${selected || 'Heading 2'}\n`;
        cursorOffset = inserted.length - 1;
      } else if (syntax === 'list') {
        inserted = `\n- ${selected || 'List item'}\n`;
        cursorOffset = inserted.length - 1;
      } else if (syntax === 'code') {
        inserted = `\n\`\`\`\n${selected || 'code block'}\n\`\`\`\n`;
        cursorOffset = inserted.length - 5;
      } else if (syntax === 'link') {
        inserted = `[${selected || 'link text'}](https://url)`;
        cursorOffset = selected ? inserted.length : 1;
      }

      const nextContent = before + inserted + after;
      handleContentChange(nextContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      }, 50);
    },
    [handleContentChange]
  );

  // Keyboard listener bound for standard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNoteId) return;

      // Ctrl + B -> Bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('bold');
      }
      // Ctrl + I -> Italic
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('italic');
      }
      // Ctrl + S -> Manual Save trigger
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (selectedNoteId) {
          updateNote(selectedNoteId, {
            content: noteContent,
            title: noteTitle,
          });
          setSaveStatus('SAVED');
          setLastSavedTime(
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          toast.success('Note manual saved successfully');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, noteContent, noteTitle, updateNote, insertMarkdown]);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Study Notes"
          subtitle="Write study notes and organize them by syllabus subjects."
        />
        <div className="h-64 border border-border bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Templates loader
  const loadTemplate = (templateName: string) => {
    let content = '';
    if (templateName === 'LECTURE') {
      content = `# Lecture Notes Outline
**Course Subject:** 
**Date:** ${new Date().toLocaleDateString()}
**Topic Summary:** 

## Key Definitions
- **Concept A:** 
- **Concept B:** 

## Critical Formulae / Rules
- 

## Revision Checklist
- [ ] Review spaced repetition cards.
- [ ] Complete unit mock syllabus mappings.`;
    } else if (templateName === 'STUDY') {
      content = `# Subject Study Guide
## Study Objectives
1. Mappings of topic syllabus points.
2. Recall triggers.

## Quick Cheat Sheet
- **Important Concept 1:** details...
- **Important Concept 2:** details...

## Focus Resources
- CLRS textbook chapters...`;
    } else if (templateName === 'FLASH') {
      content = `# Flashcard Drafts List
Write front and back recall queries here to convert to mock flashcard decks later:

## Q1
**Front:** 
**Back:** 

## Q2
**Front:** 
**Back:** `;
    }

    if (content) {
      handleContentChange(content);
      toast.success(`Template loaded: ${templateName}`);
    }
  };

  // Tag manager actions
  const handleAddTag = () => {
    if (!selectedNoteId || !selectedNote || !newTagInput.trim()) return;
    const currentTags = selectedNote.tags || [];
    const nextTag = newTagInput.trim().toLowerCase();
    if (currentTags.includes(nextTag)) {
      toast.error('Tag already exists');
      return;
    }
    const nextTags = [...currentTags, nextTag];
    addNoteTags(selectedNoteId, nextTags);
    setNewTagInput('');
    toast.success(`Added tag #${nextTag}`);
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedNoteId || !selectedNote) return;
    const nextTags = (selectedNote.tags || []).filter((t) => t !== tag);
    addNoteTags(selectedNoteId, nextTags);
    toast.success(`Removed tag #${tag}`);
  };

  // Pinned/Favorites stats
  const handleOpenCreateNote = () => {
    setEditingNote(null);
    setIsNoteDialogOpen(true);
  };

  const handleNoteFormSubmit = (data: CreateNoteInput) => {
    if (editingNote) {
      updateNote(editingNote.id, data);
      toast.success('Note updated successfully');
    } else {
      const newId = addNote(data);
      setSelectedNoteId(newId);
      toast.success('Note created successfully');
    }
    setIsNoteDialogOpen(false);
  };

  const handleConfirmDeleteNote = () => {
    if (deletingNoteId) {
      deleteNote(deletingNoteId);
      setDeletingNoteId(null);
      toast.success('Note deleted permanently');
      if (selectedNoteId === deletingNoteId) {
        setSelectedNoteId(
          notes.length > 1
            ? notes.find((n) => n.id !== deletingNoteId)?.id || null
            : null
        );
      }
    }
  };

  // Note words / characters statistics
  const getNoteStats = () => {
    if (!noteContent) return { words: 0, characters: 0, time: 0 };
    const characters = noteContent.length;
    const words = noteContent.trim().split(/\s+/).filter(Boolean).length;
    const time = Math.max(1, Math.ceil(words / 200));
    return { words, characters, time };
  };
  const stats = getNoteStats();

  // Simple Markdown parsing for preview
  const parseMarkdownToHtml = (text: string) => {
    if (!text)
      return '<p class="text-zinc-500 italic">No content written yet.</p>';
    return text
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return `<h4 class="text-xs font-extrabold text-foreground mt-3 mb-1">${trimmed.slice(4)}</h4>`;
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
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="Advanced Notes Workspace"
        subtitle="Write Markdown study templates, organize tags, auto-save files, and reference recall points."
        actions={
          <div className="flex gap-2">
            {/* Note tab toggle */}
            <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border text-[10px] font-bold select-none shrink-0">
              <button
                onClick={() => setNotesTab('ACTIVE')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  notesTab === 'ACTIVE'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground'
                }`}
              >
                Active Notes
              </button>
              <button
                onClick={() => setNotesTab('ARCHIVED')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  notesTab === 'ARCHIVED'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground'
                }`}
              >
                Archived
              </button>
            </div>

            <Button
              onClick={handleOpenCreateNote}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Note
            </Button>
          </div>
        }
      />

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search note titles / details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="text-xs font-semibold h-8 border border-input rounded-md bg-transparent px-2"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode controls */}
        {selectedNote && (
          <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border text-[10px] font-bold select-none shrink-0">
            <button
              onClick={() => setViewMode('EDITOR')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'EDITOR'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              Edit Only
            </button>
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'SPLIT'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('PREVIEW')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'PREVIEW'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No notes yet"
          description="Create your first study note to start building your advanced workspace."
          action={{
            label: 'Create Note',
            onClick: handleOpenCreateNote,
          }}
        />
      ) : (
        /* Workspace layout */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[550px] items-stretch">
          {/* LEFT SIDEBAR: List of Notes */}
          <div className="lg:col-span-1 border border-border bg-card rounded-2xl p-4 flex flex-col gap-4 max-h-[650px] overflow-y-auto">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-muted-foreground tracking-wide uppercase px-1 pb-1">
                {notesTab === 'ACTIVE' ? 'Active Notes' : 'Archived Notes'} (
                {sortedNotes.length})
              </h3>
              {sortedNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 italic">
                  No notes found here.
                </p>
              ) : (
                sortedNotes.map((note) => {
                  const sub = subjects.find((s) => s.id === note.subjectId);
                  const isSelected = note.id === selectedNoteId;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`flex items-start justify-between p-3 rounded-xl cursor-pointer border transition-colors ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-600/30 text-foreground'
                          : 'border-transparent bg-transparent hover:bg-muted/10 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {note.isPinned && (
                            <Pin className="h-3 w-3 text-purple-600 dark:text-purple-400 rotate-45 shrink-0" />
                          )}
                          {note.isFavorite && (
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                          <h4 className="text-xs font-bold truncate text-foreground">
                            {note.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate leading-normal mt-0.5">
                          {note.content
                            ? note.content.slice(0, 50)
                            : 'No content'}
                        </p>
                        {sub && (
                          <span className="inline-block text-[9px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full font-bold mt-1.5">
                            {sub.code || sub.name.slice(0, 10)}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 self-center" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT WORKSPACE: Editor & Previews */}
          <div className="lg:col-span-3 border border-border bg-card rounded-2xl flex flex-col justify-between max-h-[650px] overflow-hidden">
            {selectedNote ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* 1. Header Toolbar details */}
                <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-transparent border-0 font-extrabold text-base focus:ring-0 focus:outline-hidden p-0 text-foreground"
                      placeholder="Untitled Note"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      {saveStatus === 'SAVING' ? (
                        <span className="text-[10px] text-purple-600 animate-pulse flex items-center gap-1 font-semibold">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />{' '}
                          Saving...
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Check className="h-3 w-3 text-green-500" /> Saved (
                          {lastSavedTime})
                        </span>
                      )}
                      {subjects.find(
                        (s) => s.id === selectedNote.subjectId
                      ) && (
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-1.5 py-0.2 rounded-full font-bold">
                          {
                            subjects.find(
                              (s) => s.id === selectedNote.subjectId
                            )?.name
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => togglePinNote(selectedNote.id)}
                      title={selectedNote.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin
                        className={`h-4 w-4 ${selectedNote.isPinned ? 'text-purple-600 fill-purple-600' : ''}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => toggleFavoriteNote(selectedNote.id)}
                      title={selectedNote.isFavorite ? 'Unstar' : 'Star'}
                    >
                      <Star
                        className={`h-4 w-4 ${selectedNote.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => toggleArchiveNote(selectedNote.id)}
                      title={selectedNote.isArchived ? 'Restore' : 'Archive'}
                    >
                      <Archive
                        className={`h-4 w-4 ${selectedNote.isArchived ? 'text-purple-600' : ''}`}
                      />
                    </Button>

                    {/* Predefined templates loader select */}
                    <select
                      onChange={(e) => {
                        loadTemplate(e.target.value);
                        e.target.value = '';
                      }}
                      className="text-[10px] font-semibold h-7 border border-input rounded-md bg-transparent px-2.5 ml-1"
                    >
                      <option value="" disabled selected>
                        Templates...
                      </option>
                      <option value="LECTURE">Lecture Outline</option>
                      <option value="STUDY">Study Cheatsheet</option>
                      <option value="FLASH">Flashcard list</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive ml-1"
                      onClick={() => setDeletingNoteId(selectedNote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 2. Text Editor Markdown Toolbar */}
                {viewMode !== 'PREVIEW' && (
                  <div className="px-4 py-1.5 border-b border-border bg-muted/40 flex flex-wrap gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('bold')}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('italic')}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('h1')}
                      title="Heading 1"
                    >
                      <Heading1 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('h2')}
                      title="Heading 2"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('list')}
                      title="Bullet List"
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('code')}
                      title="Code Block"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => insertMarkdown('link')}
                      title="Insert Link"
                    >
                      <Link className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* 3. Split Editor & Preview Panels Container */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Left Plain-text Editor */}
                  {viewMode !== 'PREVIEW' && (
                    <div className="flex-1 border-r border-border h-full p-2 overflow-y-auto">
                      <textarea
                        id="note-workspace-textarea"
                        value={noteContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full h-full min-h-[300px] border-0 bg-transparent p-3 text-xs leading-relaxed focus:ring-0 focus:outline-hidden font-mono resize-none"
                        placeholder="Write dynamic Markdown note details here..."
                      />
                    </div>
                  )}

                  {/* Right Formatted Preview */}
                  {viewMode !== 'EDITOR' && (
                    <div className="flex-1 h-full p-6 overflow-y-auto bg-card prose prose-sm dark:prose-invert max-w-none">
                      <div
                        className="font-sans text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdownToHtml(noteContent),
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Tag manager interface & statistics footer */}
                <div className="p-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 text-[10px] text-muted-foreground font-semibold">
                  {/* Tags list & Tag input */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>Tags:</span>
                    </div>
                    {selectedNote.tags &&
                      selectedNote.tags.map((tag) => (
                        <span
                          key={tag}
                          onClick={() => handleRemoveTag(tag)}
                          className="inline-flex items-center gap-0.5 bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full hover:bg-red-500/10 hover:text-red-500 cursor-pointer transition-colors"
                          title="Click to remove tag"
                        >
                          #{tag} &times;
                        </span>
                      ))}
                    <div className="flex items-center gap-1 ml-1">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="add tag..."
                        className="h-5 w-16 bg-transparent border border-input rounded-md px-1 text-[9px] focus:outline-hidden focus:ring-1 focus:ring-ring"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={handleAddTag}
                        className="h-5 w-5 p-0"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Word count stats */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> {stats.words} words
                    </span>
                    <span>•</span>
                    <span>{stats.characters} characters</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {stats.time}m read
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[9px] bg-muted px-1.5 py-0.2 rounded-full font-bold">
                      <Key className="h-2.5 w-2.5" /> Ctrl+S to Save
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<FolderOpen className="h-8 w-8" />}
                  title="No note selected"
                  description="Select an active note or click 'New Note' to start drafting study guides."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NOTE DIALOG */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>
          <NoteForm
            subjects={subjects}
            topics={topics}
            onSubmit={handleNoteFormSubmit}
            onCancel={() => setIsNoteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE NOTE */}
      <ConfirmDialog
        isOpen={deletingNoteId !== null}
        onClose={() => setDeletingNoteId(null)}
        title="Delete Study Note?"
        description="Are you sure you want to permanently delete this note? This action cannot be undone."
        onConfirm={handleConfirmDeleteNote}
      />
    </div>
  );
}
