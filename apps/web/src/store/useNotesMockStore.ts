import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Note,
  Resource,
  CreateNoteInput,
  CreateResourceInput,
  NoteChunk,
  IEmbeddingStore,
  MockEmbeddingProvider,
  EmbeddingCache,
  EmbeddingService,
} from '@aelpt/shared';

interface NotesMockState {
  notes: Note[];
  resources: Resource[];
  chunks: NoteChunk[];

  // Note Actions
  addNote: (note: CreateNoteInput) => string;
  updateNote: (id: string, note: Partial<CreateNoteInput>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  toggleArchiveNote: (id: string) => void;
  addNoteTags: (id: string, tags: string[]) => void;
  saveChunks: (noteId: string, chunks: NoteChunk[]) => void;
  deleteChunks: (noteId: string) => void;

  // Resource Actions
  addResource: (res: CreateResourceInput) => string;
  updateResource: (id: string, res: Partial<CreateResourceInput>) => void;
  deleteResource: (id: string) => void;
  toggleBookmarkResource: (id: string) => void;
  toggleFavoriteResource: (id: string) => void;
  addResourceTags: (id: string, tags: string[]) => void;
  markResourceViewed: (id: string) => void;
  addMockFileAttachment: (
    title: string,
    size: string,
    type: string,
    subjectId?: string,
    topicId?: string
  ) => void;

  resetNotesStore: () => void;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note_1',
    userId: 'mock-user',
    subjectId: 'sub-1', // Link to subject if it matches mock subject ID (e.g. sub-1 for DSA)
    title: 'TCP/IP vs OSI Layer Architectures',
    content: `## OSI Reference Model (7 Layers)
1. **Physical**: Transmission of raw bit streams.
2. **Data Link**: Node-to-node framing & MAC addressing.
3. **Network**: Logical addressing & routing (IP, ICMP).
4. **Transport**: End-to-end connections, reliability, flow control (TCP, UDP).
5. **Session**: Interhost communication management.
6. **Presentation**: Data representation, syntax, decryption & encryption.
7. **Application**: Network processes to applications (HTTP, DNS).

## TCP/IP Model (4 Layers)
1. **Network Interface / Link**: MAC protocol specifications.
2. **Internet**: Routing packets across network boundaries (IP).
3. **Transport**: Process-to-process flow control (TCP, UDP).
4. **Application**: Protocols that applications use (HTTP, FTP).`,
    isPinned: true,
    isFavorite: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['networks', 'osi'],
    isArchived: false,
  },
  {
    id: 'note_2',
    userId: 'mock-user',
    title: 'Complexity Analysis of Quick Sort',
    content: `### Worst-Case Complexity: O(n²)
Occurs when the partitioning pivot constantly splits the elements into highly unbalanced sizes of 0 and n-1. Common with already-sorted arrays when choosing boundary elements as pivots.

### Best-Case & Average Complexity: O(n log n)
Occurs when partitioning yields reasonably balanced sub-problems (e.g., 50:50 splits).

### Space Complexity: O(log n)
Requires O(log n) auxiliary stack space for recursion frames.`,
    isPinned: true,
    isFavorite: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['algorithms', 'sorting'],
    isArchived: false,
  },
];

const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'res_1',
    userId: 'mock-user',
    title: 'GeeksforGeeks Dynamic Programming Track',
    url: 'https://www.geeksforgeeks.org/dynamic-programming/',
    description:
      'Comprehensive dynamic programming guide, basic-to-advanced algorithms, optimization subproblems, and practice links.',
    category: 'WEBSITE',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: true,
    isFavorite: true,
    tags: ['dsa', 'core'],
  },
  {
    id: 'res_2',
    userId: 'mock-user',
    title: 'Introduction to Algorithms (CLRS)',
    description:
      'Core reference textbook covering search, sorting, graph traversal, and complexity classes.',
    category: 'BOOK',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
    isFavorite: true,
    tags: ['textbook'],
  },
  {
    id: 'res_3',
    userId: 'mock-user',
    title: 'Database Normalization Forms Explained',
    url: 'https://www.youtube.com/watch?v=ABwD8U5y91g',
    description:
      'Video tutorial breaking down normalization steps from 1NF to BCNF with concrete tables.',
    category: 'VIDEO',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: true,
    isFavorite: false,
    tags: ['dbms', 'video'],
  },
];

// Zustand Store Bridge for note embeddings
class ZustandEmbeddingStore implements IEmbeddingStore {
  async saveChunks(noteId: string, chunks: NoteChunk[]): Promise<void> {
    useNotesMockStore.getState().saveChunks(noteId, chunks);
  }
  async getChunks(noteId: string): Promise<NoteChunk[]> {
    return useNotesMockStore
      .getState()
      .chunks.filter((c) => c.noteId === noteId);
  }
  async deleteChunks(noteId: string): Promise<void> {
    useNotesMockStore.getState().deleteChunks(noteId);
  }
}

const clientStore = new ZustandEmbeddingStore();
const clientProvider = new MockEmbeddingProvider();
const clientCache = new EmbeddingCache();
const clientEmbeddingService = new EmbeddingService(
  clientProvider,
  clientStore,
  clientCache
);

export const triggerEmbeddingForNote = async (
  noteId: string,
  content: string,
  topicId?: string,
  oldContent?: string
) => {
  try {
    await clientEmbeddingService.embedNote(
      noteId,
      content,
      topicId,
      oldContent
    );
  } catch (err) {
    console.error('Failed to generate embedding for note:', noteId, err);
  }
};

export const useNotesMockStore = create<NotesMockState>()(
  persist(
    (set) => ({
      notes: DEFAULT_NOTES,
      resources: DEFAULT_RESOURCES,
      chunks: [],

      addNote: (note) => {
        const id = `note_${Date.now()}`;
        set((state) => {
          const newNote: Note = {
            ...note,
            id,
            userId: 'mock-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            isArchived: false,
          };

          // Trigger embedding generation asynchronously
          setTimeout(() => {
            triggerEmbeddingForNote(id, note.content, note.topicId);
          }, 50);

          return { notes: [newNote, ...state.notes] };
        });
        return id;
      },

      updateNote: (id, note) => {
        set((state) => {
          const existing = state.notes.find((n) => n.id === id);
          const oldContent = existing?.content || '';

          // Trigger embedding generation asynchronously if content has changed
          if (note.content !== undefined && note.content !== oldContent) {
            setTimeout(() => {
              triggerEmbeddingForNote(
                id,
                note.content!,
                note.topicId || existing?.topicId,
                oldContent
              );
            }, 50);
          }

          return {
            notes: state.notes.map((n) =>
              n.id === id
                ? { ...n, ...note, updatedAt: new Date().toISOString() }
                : n
            ),
          };
        });
      },

      deleteNote: (id) => {
        set((state) => {
          // Trigger deletion of note chunks
          setTimeout(() => {
            clientStore.deleteChunks(id).catch(console.error);
          }, 50);

          return {
            notes: state.notes.filter((n) => n.id !== id),
          };
        });
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n
          ),
        }));
      },

      toggleFavoriteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
          ),
        }));
      },

      toggleArchiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isArchived: !n.isArchived } : n
          ),
        }));
      },

      addNoteTags: (id, tags) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, tags } : n)),
        }));
      },

      saveChunks: (noteId, noteChunks) => {
        set((state) => ({
          chunks: [
            ...state.chunks.filter((c) => c.noteId !== noteId),
            ...noteChunks,
          ],
        }));
      },

      deleteChunks: (noteId) => {
        set((state) => ({
          chunks: state.chunks.filter((c) => c.noteId !== noteId),
        }));
      },

      addResource: (res) => {
        const id = `res_${Date.now()}`;
        set((state) => {
          const newRes: Resource = {
            ...res,
            id,
            userId: 'mock-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isBookmarked: false,
            isFavorite: false,
            tags: [],
          };
          return { resources: [newRes, ...state.resources] };
        });
        return id;
      },

      updateResource: (id, res) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id
              ? { ...r, ...res, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
        }));
      },

      toggleBookmarkResource: (id) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r
          ),
        }));
      },

      toggleFavoriteResource: (id) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
          ),
        }));
      },

      addResourceTags: (id, tags) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, tags } : r
          ),
        }));
      },

      markResourceViewed: (id) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, lastViewedAt: new Date().toISOString() } : r
          ),
        }));
      },

      addMockFileAttachment: (title, size, type, subjectId, topicId) => {
        const id = `res_${Date.now()}`;
        set((state) => {
          const newRes: Resource = {
            id,
            userId: 'mock-user',
            title,
            category: type.toLowerCase().includes('pdf') ? 'PDF' : 'OTHER',
            description: `Simulated local file upload attachment. Format: ${type.toUpperCase()}`,
            fileSize: size,
            fileType: type,
            isBookmarked: false,
            isFavorite: false,
            tags: ['uploaded'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(subjectId ? { subjectId } : {}),
            ...(topicId ? { topicId } : {}),
          };
          return { resources: [newRes, ...state.resources] };
        });
      },

      resetNotesStore: () => {
        set({
          notes: DEFAULT_NOTES,
          resources: DEFAULT_RESOURCES,
          chunks: [],
        });
      },
    }),
    {
      name: 'aelpt-notes-resources-mock',
    }
  )
);
