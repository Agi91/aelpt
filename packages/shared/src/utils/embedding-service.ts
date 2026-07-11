import {
  NoteChunk,
  IEmbeddingProvider,
  IEmbeddingStore,
  IEmbeddingCache,
} from '../types/embedding.types';
import { splitIntoChunks } from './chunker';

/**
 * Orchestrates note chunking, embedding generation with caching,
 * change threshold validations, and storing note chunks.
 */
export class EmbeddingService {
  private provider: IEmbeddingProvider;
  private store: IEmbeddingStore;
  private cache: IEmbeddingCache | undefined;

  constructor(
    provider: IEmbeddingProvider,
    store: IEmbeddingStore,
    cache?: IEmbeddingCache
  ) {
    this.provider = provider;
    this.store = store;
    this.cache = cache;
  }

  /**
   * Splits a note into chunks, generates embeddings, and saves them.
   * Only processes if content changed by more than 20% compared to oldContent.
   *
   * @returns True if embedding execution took place, false if skipped or deleted.
   */
  async embedNote(
    noteId: string,
    content: string,
    topicId?: string,
    oldContent?: string
  ): Promise<boolean> {
    // Skip if change threshold is not met (<= 20% change)
    if (oldContent !== undefined && oldContent !== null) {
      const oldLen = oldContent.length;
      const newLen = content.length;
      const maxLen = Math.max(oldLen, 1);
      const deltaRatio = Math.abs(oldLen - newLen) / maxLen;

      if (deltaRatio <= 0.2 && oldContent.trim() !== '') {
        return false;
      }
    }

    const textChunks = splitIntoChunks(content, 500, 50);

    // If the text is empty or too short, clean up existing chunks
    if (textChunks.length === 0) {
      await this.store.deleteChunks(noteId);
      return false;
    }

    const noteChunks: NoteChunk[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i]!;
      let embedding: number[] | null = null;

      if (this.cache) {
        embedding = this.cache.get(chunkText);
      }

      if (!embedding) {
        embedding = await this.provider.generateEmbedding(chunkText);
        if (this.cache) {
          this.cache.set(chunkText, embedding);
        }
      }

      noteChunks.push({
        id: `chunk_${noteId}_${i}_${Date.now()}`,
        noteId,
        content: chunkText,
        embedding,
        chunkIndex: i,
        tokenCount: Math.ceil(chunkText.length / 4),
        createdAt: new Date().toISOString(),
        ...(topicId ? { topicId } : {}),
      });
    }

    await this.store.saveChunks(noteId, noteChunks);
    return true;
  }
}
