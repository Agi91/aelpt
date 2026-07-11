export interface SearchFilters {
  semesterId?: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  resourceType?: string; // category, e.g. PDF, WEBSITE
  tags?: string[];
}

export interface SearchResult {
  id: string;
  sourceId: string;
  sourceType: 'NOTE' | 'RESOURCE' | 'TOPIC';
  title: string;
  contentPreview: string;
  similarityScore: number;
  matchedTags: string[];
  breadcrumbPath: string;
  metadata: {
    semesterId?: string;
    subjectId?: string;
    unitId?: string;
    topicId?: string;
    resourceType?: string;
  };
}
