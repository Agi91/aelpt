/**
 * Calculates the cosine similarity between two vectors.
 * Returns a value between -1 and 1 (or 0 and 1 for positive spaces).
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length || vec1.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vec1.length; i++) {
    const val1 = vec1[i] || 0;
    const val2 = vec2[i] || 0;
    dotProduct += val1 * val2;
    normA += val1 * val1;
    normB += val2 * val2;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Finds the top-K items most similar to a query embedding.
 */
export function findTopK<T extends { embedding: number[] }>(
  queryEmbedding: number[],
  items: T[],
  k: number = 5
): Array<{ item: T; similarity: number }> {
  const scored = items.map((item) => ({
    item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, k);
}
