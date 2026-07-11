import {
  MockEmbeddingProvider,
  EmbeddingCache,
  EmbeddingService as BaseEmbeddingService,
} from '@aelpt/shared';
import { FirestoreEmbeddingStore } from './firestore-embedding-store';

const embeddingProvider = new MockEmbeddingProvider();
const embeddingCache = new EmbeddingCache();

/**
 * Backend service for managing note text chunking and embedding pipelines.
 */
export class EmbeddingService {
  /**
   * Performs text chunking, embedding generation, and persists vectors to Firestore.
   * Utilizes cache checks and respects a 20% content change delta threshold.
   */
  static async embedNote(
    userId: string,
    noteId: string,
    content: string,
    topicId?: string,
    oldContent?: string
  ): Promise<boolean> {
    const store = new FirestoreEmbeddingStore(userId);
    const baseService = new BaseEmbeddingService(
      embeddingProvider,
      store,
      embeddingCache
    );
    return baseService.embedNote(noteId, content, topicId, oldContent);
  }
}
