import { SearchFilters, SearchResult } from '../types/vector-search.types';
import { MockEmbeddingProvider } from './embedding-mock-provider';
import { cosineSimilarity } from './similarity';

export interface IndexItem {
  id: string;
  sourceId: string;
  sourceType: 'NOTE' | 'RESOURCE' | 'TOPIC';
  title: string;
  content: string;
  embedding: number[];
  tags: string[];
  breadcrumbPath: string;
  semesterId?: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  resourceType?: string;
}

/**
 * Reusable Vector Index store that contains structured index items.
 */
export class VectorIndex {
  private items: IndexItem[] = [];

  getItems(): IndexItem[] {
    return this.items;
  }

  addItem(item: IndexItem) {
    this.items = this.items.filter((i) => i.id !== item.id);
    this.items.push(item);
  }

  addItems(items: IndexItem[]) {
    const ids = new Set(items.map((i) => i.id));
    this.items = [...this.items.filter((i) => !ids.has(i.id)), ...items];
  }

  removeItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  removeBySourceId(sourceId: string) {
    this.items = this.items.filter((i) => i.sourceId !== sourceId);
  }

  clear() {
    this.items = [];
  }
}

/**
 * Semantic Vector Search service providing filters, rankings, thresholds, and multi-source retrieval.
 */
export class VectorSearchService {
  private index: VectorIndex;
  private provider: MockEmbeddingProvider;

  constructor(index: VectorIndex, provider: MockEmbeddingProvider) {
    this.index = index;
    this.provider = provider;
  }

  /**
   * Search vector index using a natural text query.
   */
  async search(
    query: string,
    filters?: SearchFilters,
    topK: number = 5,
    threshold: number = 0.0
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.provider.generateEmbedding(query);
    return this.searchByEmbedding(queryEmbedding, filters, topK, threshold);
  }

  /**
   * Search vector index directly using a pre-calculated embedding vector.
   */
  searchByEmbedding(
    queryEmbedding: number[],
    filters?: SearchFilters,
    topK: number = 5,
    threshold: number = 0.0
  ): SearchResult[] {
    const items = this.index.getItems();

    // Apply filters
    const filteredItems = items.filter((item) => {
      if (!filters) {
        return true;
      }

      if (filters.semesterId && item.semesterId !== filters.semesterId) {
        return false;
      }
      if (filters.subjectId && item.subjectId !== filters.subjectId) {
        return false;
      }
      if (filters.unitId && item.unitId !== filters.unitId) {
        return false;
      }
      if (filters.topicId && item.topicId !== filters.topicId) {
        return false;
      }
      if (filters.resourceType && item.resourceType !== filters.resourceType) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const hasMatchedTag = filters.tags.some((t) => item.tags.includes(t));
        if (!hasMatchedTag) {
          return false;
        }
      }

      return true;
    });

    // Score and rank
    const results: SearchResult[] = filteredItems.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);

      const preview =
        item.content.length > 160
          ? item.content.substring(0, 160) + '...'
          : item.content;

      return {
        id: item.id,
        sourceId: item.sourceId,
        sourceType: item.sourceType,
        title: item.title,
        contentPreview: preview,
        similarityScore: Number(score.toFixed(4)),
        matchedTags: item.tags,
        breadcrumbPath: item.breadcrumbPath,
        metadata: {
          ...(item.semesterId ? { semesterId: item.semesterId } : {}),
          ...(item.subjectId ? { subjectId: item.subjectId } : {}),
          ...(item.unitId ? { unitId: item.unitId } : {}),
          ...(item.topicId ? { topicId: item.topicId } : {}),
          ...(item.resourceType ? { resourceType: item.resourceType } : {}),
        },
      };
    });

    // Filter by similarity threshold & sort descending
    return results
      .filter((r) => r.similarityScore >= threshold)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topK);
  }

  /**
   * Search for items directly tied to a specific topic
   */
  searchByTopic(topicId: string, topK: number = 5): SearchResult[] {
    const items = this.index
      .getItems()
      .filter((item) => item.topicId === topicId);
    return items
      .map((item) => ({
        id: item.id,
        sourceId: item.sourceId,
        sourceType: item.sourceType,
        title: item.title,
        contentPreview: item.content.substring(0, 160),
        similarityScore: 1.0,
        matchedTags: item.tags,
        breadcrumbPath: item.breadcrumbPath,
        metadata: {
          ...(item.topicId ? { topicId: item.topicId } : {}),
          ...(item.subjectId ? { subjectId: item.subjectId } : {}),
        },
      }))
      .slice(0, topK);
  }

  /**
   * Search for items directly tied to a specific subject
   */
  searchBySubject(subjectId: string, topK: number = 5): SearchResult[] {
    const items = this.index
      .getItems()
      .filter((item) => item.subjectId === subjectId);
    return items
      .map((item) => ({
        id: item.id,
        sourceId: item.sourceId,
        sourceType: item.sourceType,
        title: item.title,
        contentPreview: item.content.substring(0, 160),
        similarityScore: 1.0,
        matchedTags: item.tags,
        breadcrumbPath: item.breadcrumbPath,
        metadata: {
          ...(item.subjectId ? { subjectId: item.subjectId } : {}),
        },
      }))
      .slice(0, topK);
  }
}
