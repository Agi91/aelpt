import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface AiMentorMockState {
  conversations: Conversation[];
  activeConversationId: string | null;

  setActiveConversationId: (id: string | null) => void;
  createNewConversation: (title?: string) => string;
  addMessage: (
    conversationId: string,
    sender: 'user' | 'assistant',
    content: string
  ) => void;
  clearConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  resetMentorStore: () => void;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    title: 'Big O Complexity Guide',
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        content: 'Hey, can you explain Big O complexity in simple terms?',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg_2',
        sender: 'assistant',
        content: `Sure! Big O notation is a way to describe how the execution time or memory space of an algorithm grows as the size of the input data (denoted as $N$) increases.

Here is a quick breakdown of common complexities:

1. **O(1) Constant Time**: Runs in the same time regardless of input size. Example:
\`\`\`typescript
function getFirstElement(arr: number[]): number {
  return arr[0]; // Constant time lookup
}
\`\`\`

2. **O(log N) Logarithmic Time**: Input size splits in half each step. Example: Binary search.
3. **O(N) Linear Time**: Time grows proportionally to input size. Example: Iterating through a single loop.
4. **O(N log N) Linearithmic**: Common in efficient sorting algorithms like Merge Sort and Quick Sort.
5. **O(N²) Quadratic Time**: Nested loops. Example: Bubble Sort.`,
        createdAt: new Date(
          Date.now() - 2 * 60 * 60 * 1000 + 10000
        ).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv_2',
    title: 'Database Normalization Forms',
    messages: [
      {
        id: 'msg_3',
        sender: 'user',
        content: 'What is Third Normal Form (3NF) in database management?',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg_4',
        sender: 'assistant',
        content: `A relation schema is in **Third Normal Form (3NF)** if it meets the following criteria:

1. It is already in **2NF** (Second Normal Form).
2. It has **no transitive dependencies** for non-prime attributes.

In other words, non-prime attributes (columns that are not part of any candidate key) must depend *only* on candidate keys, not on other non-prime attributes.

For example, if you have a table of employees:
- \`EmployeeID\` (Primary Key) -> \`DepartmentID\`
- \`DepartmentID\` -> \`DepartmentName\`

Here, \`DepartmentName\` depends on \`DepartmentID\`, which in turn depends on \`EmployeeID\`. This creates a transitive dependency (\`EmployeeID\` -> \`DepartmentName\`), violating 3NF. To resolve this, you split the relation into two tables: Employees and Departments.`,
        createdAt: new Date(
          Date.now() - 24 * 60 * 60 * 1000 + 15000
        ).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useAiMentorMockStore = create<AiMentorMockState>()(
  persist(
    (set) => ({
      conversations: DEFAULT_CONVERSATIONS,
      activeConversationId: 'conv_1',

      setActiveConversationId: (id) => {
        set({ activeConversationId: id });
      },

      createNewConversation: (title = 'New Study Session') => {
        const id = `conv_${Date.now()}`;
        set((state) => {
          const newConv: Conversation = {
            id,
            title,
            messages: [],
            createdAt: new Date().toISOString(),
          };
          return {
            conversations: [newConv, ...state.conversations],
            activeConversationId: id,
          };
        });
        return id;
      },

      addMessage: (conversationId, sender, content) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const updatedMessages = [
                ...conv.messages,
                {
                  id: `msg_${Date.now()}`,
                  sender,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ];
              // Use first user message as title if title is generic
              const title =
                conv.title === 'New Study Session' && sender === 'user'
                  ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
                  : conv.title;
              return { ...conv, title, messages: updatedMessages };
            }
            return conv;
          }),
        }));
      },

      clearConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, messages: [] } : conv
          ),
        }));
      },

      deleteConversation: (conversationId) => {
        set((state) => {
          const remaining = state.conversations.filter(
            (c) => c.id !== conversationId
          );
          return {
            conversations: remaining,
            activeConversationId:
              state.activeConversationId === conversationId
                ? remaining[0]?.id || null
                : state.activeConversationId,
          };
        });
      },

      resetMentorStore: () => {
        set({
          conversations: DEFAULT_CONVERSATIONS,
          activeConversationId: 'conv_1',
        });
      },
    }),
    {
      name: 'aelpt-ai-mentor-mock',
    }
  )
);
