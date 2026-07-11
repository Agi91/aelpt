import { Quiz, QuizQuestion, QuestionType } from '../types/quiz.types';
import { Difficulty } from '../constants/difficulty';
import { SearchResult } from '../types/vector-search.types';

interface TemplateQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  sourceReference: string;
}

/**
 * Service to compile grounded Quiz questions from vector-searched study context.
 */
export class QuizGenerator {
  /**
   * Generates a quiz from retrieved vector search context.
   */
  static generateQuizFromContext(
    context: SearchResult[],
    options: {
      title: string;
      numQuestions: number;
      difficulty: Difficulty;
      questionTypes: QuestionType[];
      subjectId?: string;
      topicId?: string;
      timeLimit?: number;
    }
  ): Quiz {
    const {
      title,
      numQuestions,
      difficulty,
      questionTypes,
      subjectId,
      topicId,
      timeLimit,
    } = options;
    const questions: QuizQuestion[] = [];
    const usedIds = new Set<string>();

    const difficultyMultiplier =
      difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : 3;

    // A collection of context-grounded domain question templates
    const domainTemplates = [
      {
        keywords: ['tcp', 'ip', 'network', 'congestion', 'protocol'],
        questions: [
          {
            type: 'MCQ' as QuestionType,
            question:
              'Which TCP mechanism regulates flow control to prevent receiver buffer overflow?',
            options: [
              'Sliding Window',
              'Three-way Handshake',
              'Congestion Window Scaling',
              'Slow Start',
            ],
            correctAnswer: 'Sliding Window',
            explanation:
              'Flow control is managed by the Sliding Window protocol where the receiver advertises its buffer window size.',
            sourceReference: 'Network Layer Context',
          },
          {
            type: 'TF' as QuestionType,
            question:
              'TCP is a connectionless transport protocol that does not guarantee message delivery.',
            correctAnswer: 'False',
            explanation:
              'TCP is connection-oriented and provides reliable, ordered, and error-checked delivery of byte streams.',
            sourceReference: 'Network Protocol Details',
          },
          {
            type: 'FILL' as QuestionType,
            question:
              'The process of establishing a TCP connection requires a ______-way handshake.',
            correctAnswer: 'three',
            explanation:
              'TCP connections are initialized via a three-way handshake (SYN, SYN-ACK, ACK).',
            sourceReference: 'TCP Connection Protocol',
          },
        ] as TemplateQuestion[],
      },
      {
        keywords: [
          'normalization',
          'normal form',
          'database',
          'dbms',
          '1nf',
          '2nf',
          '3nf',
          'bcnf',
        ],
        questions: [
          {
            type: 'MCQ' as QuestionType,
            question:
              'A table is in Third Normal Form (3NF) if it is in 2NF and has no:',
            options: [
              'Transitive dependencies',
              'Partial dependencies',
              'Multi-valued attributes',
              'Trivial functional dependencies',
            ],
            correctAnswer: 'Transitive dependencies',
            explanation:
              '3NF removes transitive functional dependencies where non-prime attributes depend on other non-prime attributes.',
            sourceReference: 'Database Normal Form Guide',
          },
          {
            type: 'TF' as QuestionType,
            question:
              'Boyce-Codd Normal Form (BCNF) is strictly stronger than Third Normal Form (3NF).',
            correctAnswer: 'True',
            explanation:
              'BCNF is a stronger version of 3NF where for every non-trivial functional dependency X -> Y, X must be a superkey.',
            sourceReference: 'BCNF Specification',
          },
          {
            type: 'FILL' as QuestionType,
            question:
              'Second Normal Form (2NF) requires that all non-prime attributes are fully dependent on the primary key, thereby eliminating ______ dependencies.',
            correctAnswer: 'partial',
            explanation:
              '2NF removes partial dependency, where non-prime attributes depend on a subset of a composite candidate key.',
            sourceReference: '2NF Schema Rules',
          },
        ] as TemplateQuestion[],
      },
      {
        keywords: ['big o', 'complexity', 'algorithm', 'sorting', 'search'],
        questions: [
          {
            type: 'MCQ' as QuestionType,
            question:
              'What is the worst-case time complexity of Quick Sort algorithm?',
            options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
            correctAnswer: 'O(n^2)',
            explanation:
              'Quick Sort degrades to O(n^2) when the pivot choice partition elements extremely unevenly (e.g. sorted arrays).',
            sourceReference: 'Sorting Complexities',
          },
          {
            type: 'TF' as QuestionType,
            question:
              'Binary Search has an average-case time complexity of O(log n) on unsorted arrays.',
            correctAnswer: 'False',
            explanation:
              'Binary Search requires the array to be sorted beforehand to achieve O(log n) complexity.',
            sourceReference: 'Binary Search Conditions',
          },
          {
            type: 'FILL' as QuestionType,
            question: 'The auxiliary space complexity of Merge Sort is ______.',
            correctAnswer: 'O(n)',
            explanation:
              'Merge Sort requires O(n) temporary space to merge sub-arrays.',
            sourceReference: 'Merge Sort Parameters',
          },
        ] as TemplateQuestion[],
      },
    ];

    // Helper to generate a contextual MCQ question from search result preview
    const makeGenericMCQ = (item: SearchResult): QuizQuestion => {
      const answers = [
        item.contentPreview.substring(0, 100),
        `Alternative definition of ${item.title} focusing on memory constraints`,
        `Experimental optimization techniques for ${item.title}`,
        `Legacy compliance specifications for ${item.title}`,
      ];
      const correct = answers[0] || 'Grounded source information';
      const shuffledOptions = [...answers].sort(
        () => Math.sin(item.id.charCodeAt(0)) - 0.5
      );

      return {
        id: `q_mcq_${item.id}`,
        type: 'MCQ',
        question: `According to retrieved study context for "${item.title}", which of the following is true?`,
        options: shuffledOptions,
        correctAnswer: correct,
        explanation: `The retrieved source material states: "${item.contentPreview}". This validates the correct option.`,
        sourceReference: `Grounded Source: ${item.breadcrumbPath} > ${item.title}`,
        scoreWeight: 10 * difficultyMultiplier,
      };
    };

    // Helper to generate a contextual True/False question
    const makeGenericTF = (item: SearchResult): QuizQuestion => {
      const isTrue = item.contentPreview.length % 2 === 0;
      const statement = isTrue
        ? `${item.title} states that: ${item.contentPreview.substring(0, 120)}`
        : `${item.title} claims that the maximum complexity is bounded by constant time regardless of state.`;

      return {
        id: `q_tf_${item.id}`,
        type: 'TF',
        question: `True or False: ${statement}`,
        correctAnswer: isTrue ? 'True' : 'False',
        explanation: isTrue
          ? `Correct. This matches the context information for ${item.title}.`
          : `Incorrect. The content does not claim constant complexity.`,
        sourceReference: `Grounded Source: ${item.breadcrumbPath} > ${item.title}`,
        scoreWeight: 5 * difficultyMultiplier,
      };
    };

    // Helper to generate a contextual Fill in the Blank question
    const makeGenericFill = (item: SearchResult): QuizQuestion => {
      const words = item.contentPreview.split(' ').filter((w) => w.length > 5);
      const blankWord = words[words.length % words.length] || 'concept';
      const cleanBlankWord = blankWord.replace(
        /[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
        ''
      );
      const questionText = item.contentPreview.replace(blankWord, '______');

      return {
        id: `q_fill_${item.id}`,
        type: 'FILL',
        question: `Fill in the blank for "${item.title}": "${questionText.substring(0, 160)}"`,
        correctAnswer: cleanBlankWord.toLowerCase(),
        explanation: `The sentence in the note reads: "${item.contentPreview}". The missing word is "${cleanBlankWord}".`,
        sourceReference: `Grounded Source: ${item.breadcrumbPath} > ${item.title}`,
        scoreWeight: 8 * difficultyMultiplier,
      };
    };

    // Helper to generate a contextual Short Answer simulator
    const makeGenericShort = (item: SearchResult): QuizQuestion => {
      return {
        id: `q_short_${item.id}`,
        type: 'SHORT',
        question: `Briefly explain the primary application and utility of "${item.title}" based on the text.`,
        correctAnswer: item.contentPreview.substring(0, 100) + '...',
        explanation: `Key points to cover: ${item.contentPreview.substring(0, 200)}`,
        sourceReference: `Grounded Source: ${item.breadcrumbPath} > ${item.title}`,
        scoreWeight: 15 * difficultyMultiplier,
      };
    };

    // Let's first search matching templates based on retrieved context text keywords
    if (context.length > 0) {
      for (const res of context) {
        if (!res) continue;
        const titleLower = res.title.toLowerCase();
        const contentLower = res.contentPreview.toLowerCase();

        for (const template of domainTemplates) {
          const matchesKeyword = template.keywords.some(
            (k) => titleLower.includes(k) || contentLower.includes(k)
          );

          if (matchesKeyword) {
            for (const q of template.questions) {
              if (questionTypes.includes(q.type) && !usedIds.has(q.question)) {
                questions.push({
                  id: `q_tpl_${res.id}_${Math.random().toString(36).substring(2, 7)}`,
                  type: q.type,
                  question: q.question,
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
                  sourceReference:
                    q.sourceReference ||
                    `Retrieval Context: ${res.breadcrumbPath} > ${res.title}`,
                  scoreWeight:
                    (q.type === 'MCQ' ? 10 : q.type === 'TF' ? 5 : 8) *
                    difficultyMultiplier,
                  ...(q.options !== undefined ? { options: q.options } : {}),
                });
                usedIds.add(q.question);
              }
            }
          }
        }
      }
    }

    // Now fill the rest of the question quota dynamically from the context items using generic generators
    let contextIdx = 0;
    while (questions.length < numQuestions && context.length > 0) {
      const item = context[contextIdx % context.length];
      if (!item) {
        contextIdx++;
        continue;
      }
      const type =
        questionTypes[questions.length % questionTypes.length] || 'MCQ';
      let q: QuizQuestion | null = null;

      if (type === 'MCQ') {
        q = makeGenericMCQ(item);
      } else if (type === 'TF') {
        q = makeGenericTF(item);
      } else if (type === 'FILL') {
        q = makeGenericFill(item);
      } else if (type === 'SHORT') {
        q = makeGenericShort(item);
      }

      if (q && !usedIds.has(q.question)) {
        questions.push(q);
        usedIds.add(q.question);
      }

      contextIdx++;
      if (contextIdx > context.length * 3) {
        break;
      }
    }

    // Fallback: If we still don't have enough questions, generate general engineering trivia questions
    const fallbackTrivia: Omit<QuizQuestion, 'id'>[] = [
      {
        type: 'MCQ',
        question:
          'Which sorting algorithm has a logarithmic worst-case complexity?',
        options: ['Merge Sort', 'Bubble Sort', 'Insertion Sort', 'Quick Sort'],
        correctAnswer: 'Merge Sort',
        explanation:
          'Merge Sort guarantees O(n log n) time complexity in all cases (best, average, worst).',
        sourceReference: 'General Computer Science Knowledge',
        scoreWeight: 10,
      },
      {
        type: 'TF',
        question:
          'HTTP is a stateful protocol that remembers previous request histories.',
        correctAnswer: 'False',
        explanation:
          'HTTP is stateless; each request is executed independently of prior requests.',
        sourceReference: 'General Web Architecture Concepts',
        scoreWeight: 5,
      },
      {
        type: 'FILL',
        question:
          'In object-oriented programming, the process of hiding internal details is called ______.',
        correctAnswer: 'encapsulation',
        explanation:
          "Encapsulation restricts direct access to some of an object's components.",
        sourceReference: 'OOP Paradigms',
        scoreWeight: 8,
      },
    ];

    let triviaIdx = 0;
    while (
      questions.length < numQuestions &&
      triviaIdx < fallbackTrivia.length
    ) {
      const q = fallbackTrivia[triviaIdx];
      if (q && questionTypes.includes(q.type) && !usedIds.has(q.question)) {
        questions.push({
          id: `q_fb_${triviaIdx}`,
          type: q.type,
          question: q.question,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sourceReference: q.sourceReference,
          scoreWeight:
            (q.type === 'MCQ' ? 10 : q.type === 'TF' ? 5 : 8) *
            difficultyMultiplier,
          ...(q.options !== undefined ? { options: q.options } : {}),
        });
        usedIds.add(q.question);
      }
      triviaIdx++;
    }

    const finalQuestions = questions.slice(0, numQuestions);

    return {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title || 'Contextual Knowledge Quiz',
      questions: finalQuestions,
      difficulty,
      ...(timeLimit !== undefined ? { timeLimit } : {}),
      ...(subjectId !== undefined ? { subjectId } : {}),
      ...(topicId !== undefined ? { topicId } : {}),
      createdAt: new Date().toISOString(),
    };
  }
}
