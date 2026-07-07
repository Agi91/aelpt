import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoiceSession {
  id: string;
  title: string;
  duration: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  confidence: number; // e.g. 0.98 for AI confidence indicators
  audioUrl?: string; // mock audio URL for simulated audio playback
  createdAt: string;
}

interface VoiceAssistantState {
  history: VoiceSession[];
  activeSessionId: string | null;

  addSession: (session: Omit<VoiceSession, 'id' | 'createdAt'>) => string;
  deleteSession: (id: string) => void;
  updateSessionTranscript: (id: string, transcript: string) => void;
  setActiveSessionId: (id: string | null) => void;
  resetVoiceStore: () => void;
}

const DEFAULT_HISTORY: VoiceSession[] = [
  {
    id: 'voice_1',
    title: 'Algorithms Lecture Notes Review',
    duration: '02:15',
    transcript:
      "In today's review session, we focused on binary tree traversals. Specifically preorder, inorder, and postorder methods. Preorder visits the root node, then recursively visits the left subtree, then the right subtree. Inorder traverses the left subtree, visits the root node, and then the right subtree. Postorder traverses left, then right, and visits the root last.",
    summary:
      'A quick breakdown of binary tree traversal sequences (Preorder, Inorder, Postorder) and visitation ordering.',
    keyPoints: [
      'Preorder traversal follows Root -> Left -> Right sequence.',
      'Inorder traversal follows Left -> Root -> Right sequence (yields sorted keys in a BST).',
      'Postorder traversal follows Left -> Right -> Root sequence.',
    ],
    actionItems: [
      'Write recursive traversal function structures in TypeScript.',
      'Practice drawing traversal outputs for unbalanced trees.',
    ],
    confidence: 0.98,
    audioUrl: 'mock_audio_url_1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'voice_2',
    title: 'Normalization Rules Overview',
    duration: '01:05',
    transcript:
      'We reviewed database normal form rules. Third Normal Form requires satisfying Second Normal Form first, and then removing transitive functional dependencies where non-prime attributes depend on other non-prime columns rather than candidate keys.',
    summary:
      'Core rules of Third Normal Form (3NF) and the elimination of transitive anomalies.',
    keyPoints: [
      '3NF requires 2NF compliance and zero transitive dependencies.',
      'Transitive dependency occurs when A -> B and B -> C, making A -> C.',
    ],
    actionItems: [
      'Deconstruct database anomalies example employee table.',
      'Attempt DBMS normalization quiz.',
    ],
    confidence: 0.95,
    audioUrl: 'mock_audio_url_2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useVoiceAssistantMockStore = create<VoiceAssistantState>()(
  persist(
    (set) => ({
      history: DEFAULT_HISTORY,
      activeSessionId: 'voice_1',

      addSession: (session) => {
        const id = `voice_${Date.now()}`;
        set((state) => {
          const newSession: VoiceSession = {
            ...session,
            id,
            createdAt: new Date().toISOString(),
          };
          return {
            history: [newSession, ...state.history],
            activeSessionId: id,
          };
        });
        return id;
      },

      deleteSession: (id) => {
        set((state) => {
          const remaining = state.history.filter((s) => s.id !== id);
          return {
            history: remaining,
            activeSessionId:
              state.activeSessionId === id
                ? remaining[0]?.id || null
                : state.activeSessionId,
          };
        });
      },

      updateSessionTranscript: (id, transcript) => {
        set((state) => ({
          history: state.history.map((s) =>
            s.id === id ? { ...s, transcript } : s
          ),
        }));
      },

      setActiveSessionId: (id) => {
        set({ activeSessionId: id });
      },

      resetVoiceStore: () => {
        set({
          history: DEFAULT_HISTORY,
          activeSessionId: 'voice_1',
        });
      },
    }),
    {
      name: 'aelpt-voice-assistant-mock',
    }
  )
);
