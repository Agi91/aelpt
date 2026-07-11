import { NoteChunk, IEmbeddingStore } from '@aelpt/shared';
import { db } from '../../firebase/firestore';

/**
 * Production-ready Firestore implementation of IEmbeddingStore for the backend.
 * Stores note chunks at: users/{uid}/notes/{noteId}/chunks/{chunkId}
 */
export class FirestoreEmbeddingStore implements IEmbeddingStore {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async saveChunks(noteId: string, chunks: NoteChunk[]): Promise<void> {
    // Delete existing chunks first to ensure clean state
    await this.deleteChunks(noteId);

    const batch = db.batch();

    for (const chunk of chunks) {
      const docRef = db
        .collection('users')
        .doc(this.userId)
        .collection('notes')
        .doc(noteId)
        .collection('chunks')
        .doc(chunk.id);

      batch.set(docRef, chunk);
    }

    await batch.commit();
  }

  async getChunks(noteId: string): Promise<NoteChunk[]> {
    const snapshot = await db
      .collection('users')
      .doc(this.userId)
      .collection('notes')
      .doc(noteId)
      .collection('chunks')
      .orderBy('chunkIndex', 'asc')
      .get();

    const chunks: NoteChunk[] = [];
    snapshot.forEach((doc) => {
      chunks.push(doc.data() as NoteChunk);
    });

    return chunks;
  }

  async deleteChunks(noteId: string): Promise<void> {
    const snapshot = await db
      .collection('users')
      .doc(this.userId)
      .collection('notes')
      .doc(noteId)
      .collection('chunks')
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
