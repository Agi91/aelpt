import {
  AiGenerateRequest,
  AiGenerateResponse,
  AiStreamResponseChunk,
} from '@aelpt/shared';
import { IAiProvider } from './provider.interface';

export class MockAiProvider implements IAiProvider {
  private getMockReply(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('flashcard') || lower.includes('qa')) {
      return JSON.stringify(
        [
          {
            front:
              'What is the runtime complexity of accessing an element in an array?',
            back: 'O(1) constant time, since index offsets map directly to memory addresses.',
          },
          {
            front:
              'What does atomic data represent in relational database theory?',
            back: 'Atomic data elements are indivisible values that cannot be broken down further (First Normal Form).',
          },
          {
            front: 'How does linear probing resolve collisions in hash maps?',
            back: 'By searching sequentially for the next available slot in the array index table.',
          },
        ],
        null,
        2
      );
    }

    if (
      lower.includes('quiz') ||
      lower.includes('mcq') ||
      lower.includes('practice question')
    ) {
      return JSON.stringify(
        [
          {
            question:
              'Which scheduling system restarts repetitions to zero on poor user quality scores?',
            options: [
              'SuperMemo-2 (SM-2)',
              'Leitner System',
              'Anki Box',
              'None of these',
            ],
            correctAnswer: 'SuperMemo-2 (SM-2)',
            explanation:
              'In SM-2, if score quality rating is less than 3, repetition count resets to 0.',
          },
          {
            question:
              'What is the average complexity of looking up a value in a balanced BST?',
            options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
            correctAnswer: 'O(log N)',
            explanation:
              'Balanced binary search trees split search candidate lists in half on each step traversal.',
          },
        ],
        null,
        2
      );
    }

    if (
      lower.includes('summarize') ||
      lower.includes('synopsis') ||
      lower.includes('summary')
    ) {
      return `### AI Synopsis Summary
- **Key Focus**: Implement clean separation of query concerns across system boundaries.
- **Complexity Targets**: Logarithmic scales are optimal for standard BST node traversals.
- **Action Steps**: Complete daily spaced repetition review logs.`;
    }

    if (
      lower.includes('explain') ||
      lower.includes('analogy') ||
      lower.includes('deep dive')
    ) {
      return `### Concept Explanation
- **EL5 (Simple)**: Think of looking up a name in a phone book. You open to the middle, check the letter, and split the pages in half each time instead of reading page-by-page.
- **Deep Dive**: Access complexity scales at exactly $O(\\log N)$ because dividing search items by 2 repeatedly generates growth curves proportional to binary trees height.`;
    }

    return `I am your study companion tutor. Let me know if you would like me to generate flashcard review sessions, quiz questionnaires, note summaries, or explanations.`;
  }

  async generateText(request: AiGenerateRequest): Promise<AiGenerateResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const reply = this.getMockReply(request.prompt);
    return {
      text: reply,
      usage: {
        promptTokens: request.prompt.length / 4,
        candidatesTokens: reply.length / 4,
        totalTokens: (request.prompt.length + reply.length) / 4,
      },
    };
  }

  async generateStream(
    request: AiGenerateRequest,
    onChunk: (chunk: AiStreamResponseChunk) => void
  ): Promise<AiGenerateResponse> {
    const reply = this.getMockReply(request.prompt);

    // Simulate streaming chunks
    const chunkSize = 8;
    let offset = 0;

    while (offset < reply.length) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      const chunkText = reply.substring(offset, offset + chunkSize);
      offset += chunkSize;

      onChunk({
        text: chunkText,
        done: offset >= reply.length,
      });
    }

    return {
      text: reply,
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        candidatesTokens: Math.ceil(reply.length / 4),
        totalTokens: Math.ceil((request.prompt.length + reply.length) / 4),
      },
    };
  }
}
