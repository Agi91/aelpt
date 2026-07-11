import { IEmbeddingCache } from '../types/embedding.types';

/**
 * Standard in-memory cache for text embeddings with optional TTL (Time To Live).
 */
export class EmbeddingCache implements IEmbeddingCache {
  private cache = new Map<string, { embedding: number[]; timestamp: number }>();
  private ttlMs: number;

  constructor(ttlMs: number = 30 * 60 * 1000) {
    // Default to 30 minutes
    this.ttlMs = ttlMs;
  }

  get(text: string): number[] | null {
    const entry = this.cache.get(text);
    if (!entry) {
      return null;
    }
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(text);
      return null;
    }
    return entry.embedding;
  }

  set(text: string, embedding: number[]): void {
    this.cache.set(text, {
      embedding,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
