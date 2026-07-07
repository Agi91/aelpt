'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pin,
  Star,
  Trash2,
  Edit3,
  BookOpen,
  FolderOpen,
  ChevronRight,
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

export default function NotesPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Stores
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    toggleFavoriteNote,
  } = useNotesMockStore();
  const { subjects, topics } = useAcademicMockStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Selected Note to view/edit in split pane
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Modal Dialogs
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Auto select first note on load if available
    if (notes.length > 0 && notes[0]) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes]);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Study Notes"
          subtitle="Capture and format markdown notes linked to your classes."
        />
        <div className="h-48 border border-border bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      filterSubjectId === 'ALL' || n.subjectId === filterSubjectId;
    const matchesFav = !filterFavorites || n.isFavorite;
    return matchesSearch && matchesSubject && matchesFav;
  });

  // Sort notes: pinned ones go first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Handlers
  const handleOpenCreateNote = () => {
    setEditingNote(null);
    setIsNoteDialogOpen(true);
  };

  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleNoteSubmit = (data: CreateNoteInput) => {
    if (editingNote) {
      updateNote(editingNote.id, data);
    } else {
      const newId = addNote(data);
      setSelectedNoteId(newId);
    }
    setIsNoteDialogOpen(false);
  };

  const handleConfirmDeleteNote = () => {
    if (deletingNoteId) {
      deleteNote(deletingNoteId);
      setDeletingNoteId(null);
      if (selectedNoteId === deletingNoteId) {
        setSelectedNoteId(
          notes.length > 1
            ? notes.find((n) => n.id !== deletingNoteId)?.id || null
            : null
        );
      }
    }
  };

  // Simple Markdown parsing for preview on right panel
  const renderNoteMarkdown = (text: string) => {
    if (!text)
      return '<p class="text-zinc-500 italic">No content written yet.</p>';
    return text
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
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="Study Notes"
        subtitle="Write study notes and organize them by syllabus subjects."
        actions={
          <Button
            onClick={handleOpenCreateNote}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Note
          </Button>
        }
      />

      {/* Search & Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="text-xs font-semibold h-8 border border-input rounded-md bg-transparent px-2.5"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <Button
            variant={filterFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterFavorites(!filterFavorites)}
            className="text-xs h-8 gap-1.5"
          >
            <Star
              className={`h-3.5 w-3.5 ${filterFavorites ? 'fill-amber-400 text-amber-400' : ''}`}
            />
            Starred
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No notes captured"
          description="Create your first study note to organize topics."
          action={{
            label: 'Create Note',
            onClick: handleOpenCreateNote,
          }}
        />
      ) : (
        /* Split Pane Layout */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
          {/* Notes Left Sidebar List */}
          <div className="md:col-span-1 border border-border bg-card rounded-2xl p-4 flex flex-col gap-3 max-h-[600px] overflow-y-auto">
            <h3 className="text-xs font-bold text-muted-foreground tracking-wide uppercase px-1">
              Note Entries
            </h3>
            <div className="space-y-1">
              {sortedNotes.map((note) => {
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
              })}
            </div>
          </div>

          {/* Notes Right Display & Content Viewer */}
          <div className="md:col-span-2 border border-border bg-card rounded-2xl p-6 flex flex-col justify-between max-h-[600px] overflow-y-auto">
            {selectedNote ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground leading-tight">
                        {selectedNote.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          Updated{' '}
                          {new Date(
                            selectedNote.updatedAt
                          ).toLocaleDateString()}
                        </span>
                        {subjects.find(
                          (s) => s.id === selectedNote.subjectId
                        ) && (
                          <span className="inline-block text-[9px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-1.5 py-0.2 rounded-full font-bold">
                            {
                              subjects.find(
                                (s) => s.id === selectedNote.subjectId
                              )?.name
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toolbar Actions */}
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
                        title={
                          selectedNote.isFavorite ? 'Unfavorite' : 'Favorite'
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${selectedNote.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEditNote(selectedNote)}
                        title="Edit Note"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingNoteId(selectedNote.id)}
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rendered Preview Box */}
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none mt-6 text-sm border-t border-border pt-4 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: renderNoteMarkdown(selectedNote.content),
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<FolderOpen className="h-8 w-8" />}
                  title="No note selected"
                  description="Select a note from the sidebar list or create a new entry to inspect detail notes."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE/EDIT NOTE DIALOG */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Study Note' : 'Create Study Note'}
            </DialogTitle>
          </DialogHeader>
          <NoteForm
            subjects={subjects}
            topics={topics}
            {...(editingNote ? { initialValues: editingNote } : {})}
            onSubmit={handleNoteSubmit}
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
