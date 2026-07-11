import {
  VectorIndex,
  VectorSearchService,
  MockEmbeddingProvider,
  IndexItem,
} from '@aelpt/shared';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';

/**
 * Rebuilds the unified vector index from Note chunks, Resources, and Topics.
 * Dynamically generates mock embeddings for resources/topics using the deterministic mock provider.
 */
export const rebuildVectorIndex = async (): Promise<VectorSearchService> => {
  const index = new VectorIndex();
  const provider = new MockEmbeddingProvider();

  const notes = useNotesMockStore.getState().notes;
  const chunks = useNotesMockStore.getState().chunks;
  const resources = useNotesMockStore.getState().resources;
  const topics = useAcademicMockStore.getState().topics;
  const semesters = useAcademicMockStore.getState().semesters;
  const subjects = useAcademicMockStore.getState().subjects;
  const units = useAcademicMockStore.getState().units;

  const items: IndexItem[] = [];

  // 1. Index Notes (via pre-saved Chunks with fallback)
  for (const note of notes) {
    const noteChunks = chunks.filter((c) => c.noteId === note.id);
    const subject = subjects.find((s) => s.id === note.subjectId);
    const semester = semesters.find((sem) => sem.id === subject?.semesterId);
    const path =
      [semester?.name, subject?.name].filter(Boolean).join(' > ') || 'Notes';

    if (noteChunks.length > 0) {
      for (const chunk of noteChunks) {
        items.push({
          id: chunk.id,
          sourceId: note.id,
          sourceType: 'NOTE',
          title: note.title,
          content: chunk.content,
          embedding: chunk.embedding,
          tags: note.tags,
          breadcrumbPath: path,
          ...(note.subjectId ? { subjectId: note.subjectId } : {}),
          ...(note.topicId ? { topicId: note.topicId } : {}),
          ...(subject?.semesterId ? { semesterId: subject.semesterId } : {}),
        });
      }
    } else if (note.content.trim().length > 0) {
      const embedding = await provider.generateEmbedding(note.content);
      items.push({
        id: `note_fallback_${note.id}`,
        sourceId: note.id,
        sourceType: 'NOTE',
        title: note.title,
        content: note.content,
        embedding,
        tags: note.tags,
        breadcrumbPath: path,
        ...(note.subjectId ? { subjectId: note.subjectId } : {}),
        ...(note.topicId ? { topicId: note.topicId } : {}),
        ...(subject?.semesterId ? { semesterId: subject.semesterId } : {}),
      });
    }
  }

  // 2. Index Resources
  for (const res of resources) {
    const subject = subjects.find((s) => s.id === res.subjectId);
    const semester = semesters.find((sem) => sem.id === subject?.semesterId);
    const path = [semester?.name, subject?.name, 'Resources']
      .filter(Boolean)
      .join(' > ');
    const desc = res.description || '';
    const content = `${res.title}. ${desc}`;

    const embedding = await provider.generateEmbedding(content);
    items.push({
      id: `res_idx_${res.id}`,
      sourceId: res.id,
      sourceType: 'RESOURCE',
      title: res.title,
      content: content,
      embedding,
      tags: res.tags,
      breadcrumbPath: path,
      resourceType: res.category,
      ...(res.subjectId ? { subjectId: res.subjectId } : {}),
      ...(res.topicId ? { topicId: res.topicId } : {}),
      ...(subject?.semesterId ? { semesterId: subject.semesterId } : {}),
    });
  }

  // 3. Index Topics
  for (const topic of topics) {
    const unit = units.find((u) => u.id === topic.unitId);
    const subject = subjects.find((s) => s.id === unit?.subjectId);
    const semester = semesters.find((sem) => sem.id === subject?.semesterId);
    const path = [semester?.name, subject?.name, unit?.name]
      .filter(Boolean)
      .join(' > ');
    const content = `${topic.title}. Understanding Score: ${topic.understandingScore}%. Status: ${topic.status}`;

    const embedding = await provider.generateEmbedding(content);
    items.push({
      id: `topic_idx_${topic.id}`,
      sourceId: topic.id,
      sourceType: 'TOPIC',
      title: topic.title,
      content: content,
      embedding,
      tags: [],
      breadcrumbPath: path,
      topicId: topic.id,
      ...(unit?.id ? { unitId: unit.id } : {}),
      ...(subject?.id ? { subjectId: subject.id } : {}),
      ...(subject?.semesterId ? { semesterId: subject.semesterId } : {}),
    });
  }

  index.addItems(items);
  return new VectorSearchService(index, provider);
};
