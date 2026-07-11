/**
 * Splits text into chunks respecting sentence boundaries and token limits.
 *
 * @param text The input text to chunk.
 * @param maxTokens The maximum number of tokens per chunk (1 token ≈ 4 characters).
 * @param overlap The overlap between consecutive chunks in tokens.
 * @returns An array of string chunks.
 */
export function splitIntoChunks(
  text: string,
  maxTokens: number = 500,
  overlap: number = 50
): string[] {
  const tokenLength = Math.ceil(text.length / 4);
  // Returns empty array for text < 50 tokens
  if (tokenLength < 50) {
    return [];
  }

  // Split into sentences, keeping the punctuation
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+(?:\s+|$)/g) || [
    text,
  ];

  const chunks: string[] = [];
  let currentChunkSentences: string[] = [];
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = Math.ceil(sentence.length / 4);

    // If a single sentence exceeds the token limit by itself
    if (sentenceTokens > maxTokens) {
      if (currentChunkSentences.length > 0) {
        chunks.push(currentChunkSentences.join('').trim());
        currentChunkSentences = [];
        currentTokens = 0;
      }
      chunks.push(sentence.trim());
      continue;
    }

    if (currentTokens + sentenceTokens > maxTokens) {
      chunks.push(currentChunkSentences.join('').trim());

      // Calculate overlap: keep sentences from the end of the current chunk that fit within the overlap limit
      let overlapTokens = 0;
      const overlapSentences: string[] = [];
      for (let i = currentChunkSentences.length - 1; i >= 0; i--) {
        const s = currentChunkSentences[i]!;
        const sTok = Math.ceil(s.length / 4);
        if (overlapTokens + sTok <= overlap) {
          overlapSentences.unshift(s);
          overlapTokens += sTok;
        } else {
          break;
        }
      }
      currentChunkSentences = [...overlapSentences, sentence];
      currentTokens = overlapTokens + sentenceTokens;
    } else {
      currentChunkSentences.push(sentence);
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunkSentences.length > 0) {
    chunks.push(currentChunkSentences.join('').trim());
  }

  return chunks.filter((c) => c.length > 0);
}
