export const PROMPT_TEMPLATES = {
  /**
   * Generates recall flashcards.
   */
  generateFlashcards: (subject: string, topic: string, count: number) => {
    return `Generate exactly ${count} educational flashcards for subject "${subject}" under the topic topic "${topic}".
Each flashcard must contain a "front" side (the question or term) and a "back" side (the concise explanation or answer).
Return your response as a valid JSON array of objects with keys "front" and "back". Do not add markdown wrapping or explanation blocks outside the JSON array structure.`;
  },

  /**
   * Generates interactive multiple-choice quiz questions.
   */
  generateQuiz: (subject: string, topic: string, count: number) => {
    return `Generate exactly ${count} multiple choice practice questions for subject "${subject}" and topic "${topic}".
Each question should test core conceptual understand.
Each object must contain "question" (string), "options" (array of 4 strings), "correctAnswer" (string matching one of the options), and "explanation" (string explaining why it is correct).
Return your response as a valid JSON array matching this format.`;
  },

  /**
   * Generates study summary notes.
   */
  summarizeNotes: (noteTitle: string, noteContent: string) => {
    return `Summarize the following study note titled "${noteTitle}".
Provide a concise overview focusing on key takeaways, definitions, and action points.

Content:
${noteContent}

Format output cleanly in Markdown with headers and bullet points.`;
  },

  /**
   * Generates analogy explanations.
   */
  explainConcept: (
    conceptName: string,
    style: 'simple' | 'deep' | 'analogy'
  ) => {
    const instructions = {
      simple:
        'Explain this concept to a five-year-old child using simple language, short sentences, and everyday terminology.',
      deep: 'Provide a rigorous, deep technical explanation of this concept, covering mathematical properties, edge cases, and design trade-offs.',
      analogy:
        'Explain this concept using a strong structural analogy, comparing it to an everyday process or common physical object.',
    };

    return `Concept to explain: "${conceptName}"
Instructions: ${instructions[style]}
Return your response formatted in clean markdown.`;
  },
};
