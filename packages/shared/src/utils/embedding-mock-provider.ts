import { IEmbeddingProvider } from '../types/embedding.types';

/**
 * Deterministic mock embedding generator of 768 dimensions.
 * Computes L2 normalized vectors using a hash seed of the input text.
 */
export class MockEmbeddingProvider implements IEmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    const dimensions = 768;
    const embedding: number[] = new Array(dimensions).fill(0);

    // Hash the input string to create a seed
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate values deterministically
    for (let d = 0; d < dimensions; d++) {
      hash = (1103515245 * hash + 12345) & 0x7fffffff;
      embedding[d] = (hash / 0x7fffffff) * 2 - 1;
    }

    // L2 Normalize vector
    let norm = 0;
    for (let d = 0; d < dimensions; d++) {
      norm += (embedding[d] || 0) * (embedding[d] || 0);
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let d = 0; d < dimensions; d++) {
        embedding[d] = (embedding[d] || 0) / norm;
      }
    }

    return embedding;
  }
}
