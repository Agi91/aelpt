export interface NoteChunk {
  id: string;
  noteId: string;
  topicId?: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  tokenCount: number;
  createdAt: string;
}

export interface IEmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export interface EmbeddingCacheEntry {
  embedding: number[];
  timestamp: number;
}

export interface IEmbeddingStore {
  saveChunks(noteId: string, chunks: NoteChunk[]): Promise<void>;
  getChunks(noteId: string): Promise<NoteChunk[]>;
  deleteChunks(noteId: string): Promise<void>;
}

export interface IEmbeddingCache {
  get(text: string): number[] | null;
  set(text: string, embedding: number[]): void;
  clear(): void;
}
