'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Search,
  History,
  SlidersHorizontal,
  Bookmark,
  FileText,
  FolderClosed,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState } from '@/components/common';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useVectorSearchMockStore } from '@/store/useVectorSearchMockStore';
import { rebuildVectorIndex } from '@/lib/ai/vector-search-bridge';
import {
  SearchResult,
  SearchFilters,
  VectorSearchService,
} from '@aelpt/shared';

export default function SemanticSearchPage() {
  const { recentSearches, addSearchToHistory, clearHistory, cacheResults } =
    useVectorSearchMockStore();
  const { semesters, subjects, units, topics } = useAcademicMockStore();
  const { notes, resources } = useNotesMockStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Threshold and Top-K State
  const [threshold, setThreshold] = useState(0.4); // default 40% similarity match
  const [topK, setTopK] = useState(5);

  // Rebuild vector index reference
  const [searchService, setSearchService] =
    useState<VectorSearchService | null>(null);

  // Initialize/rebuild vector index
  useEffect(() => {
    const initIndex = async () => {
      try {
        const service = await rebuildVectorIndex();
        setSearchService(service);
      } catch (err) {
        console.error('Failed to build vector index:', err);
        toast.error('Failed to initialize semantic search index');
      }
    };
    void initIndex();
  }, [notes, resources, topics]);

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) {
      e.preventDefault();
    }
    const searchQuery = customQuery !== undefined ? customQuery : query;
    if (!searchQuery.trim()) {
      return;
    }

    if (!searchService) {
      toast.error('Search service is not ready yet');
      return;
    }

    addSearchToHistory(searchQuery);

    startTransition(async () => {
      try {
        const filters: SearchFilters = {
          ...(semesterId ? { semesterId } : {}),
          ...(subjectId ? { subjectId } : {}),
          ...(unitId ? { unitId } : {}),
          ...(topicId ? { topicId } : {}),
          ...(resourceType ? { resourceType } : {}),
          ...(tagFilter ? { tags: [tagFilter.trim().toLowerCase()] } : {}),
        };

        const searchResults = await searchService.search(
          searchQuery,
          filters,
          topK,
          threshold
        );

        setResults(searchResults);
        cacheResults(searchQuery, searchResults);
      } catch (err) {
        console.error('Semantic search error:', err);
        toast.error('An error occurred during vector retrieval');
      }
    });
  };

  const getSourceIcon = (sourceType: string) => {
    if (sourceType === 'NOTE') {
      return <FileText className="h-3 w-3 text-blue-500" />;
    }
    if (sourceType === 'RESOURCE') {
      return <Bookmark className="h-3 w-3 text-emerald-500" />;
    }
    return <FolderClosed className="h-3 w-3 text-purple-500" />;
  };

  const getSourceBadgeColor = (sourceType: string) => {
    if (sourceType === 'NOTE') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
    if (sourceType === 'RESOURCE') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 0.8) {
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    }
    if (score >= 0.6) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    }
    return 'bg-muted text-muted-foreground border border-border';
  };

  const filteredSubjects = semesterId
    ? subjects.filter((s) => s.semesterId === semesterId)
    : subjects;
  const filteredUnits = subjectId
    ? units.filter((u) => u.subjectId === subjectId)
    : units;
  const filteredTopics = unitId
    ? topics.filter((t) => t.unitId === unitId)
    : topics;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semantic Vector Search"
        subtitle="Perform similarity search using mock vector embeddings across all your study topics, notes, and resources."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              toast.info('Reindexing semantic database...');
              const service = await rebuildVectorIndex();
              setSearchService(service);
              toast.success('Search index rebuilt successfully');
            }}
            className="text-xs h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reindex database
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search controls & Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />{' '}
                Search Options
              </h3>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setSemesterId('');
                  setSubjectId('');
                  setUnitId('');
                  setTopicId('');
                  setResourceType('');
                  setTagFilter('');
                  setThreshold(0.4);
                  setTopK(5);
                }}
                className="text-[10px] text-purple-600 dark:text-purple-400 hover:bg-transparent"
              >
                Clear all
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 text-xs">
              {/* Threshold Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">
                    Similarity score:
                  </span>
                  <span className="text-foreground font-bold">
                    {Math.round(threshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(threshold * 100)}
                  onChange={(e) =>
                    setThreshold(parseFloat(e.target.value) / 100)
                  }
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Top-K limit selection */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">
                  Top-K Results Limit:
                </label>
                <select
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-hidden"
                >
                  <option value={3}>3 Results</option>
                  <option value={5}>5 Results</option>
                  <option value={10}>10 Results</option>
                  <option value={20}>20 Results</option>
                </select>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wide">
                  Category Filters
                </p>

                {/* Semester filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground">Semester:</label>
                  <select
                    value={semesterId}
                    onChange={(e) => {
                      setSemesterId(e.target.value);
                      setSubjectId('');
                      setUnitId('');
                      setTopicId('');
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground">Subject:</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setUnitId('');
                      setTopicId('');
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">All Subjects</option>
                    {filteredSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground">Unit:</label>
                  <select
                    value={unitId}
                    onChange={(e) => {
                      setUnitId(e.target.value);
                      setTopicId('');
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">All Units</option>
                    {filteredUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground">Topic:</label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">All Topics</option>
                    {filteredTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resource category filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground">
                    Resource Type:
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs"
                  >
                    <option value="">All Types</option>
                    <option value="BOOK">Book</option>
                    <option value="VIDEO">Video</option>
                    <option value="WEBSITE">Website</option>
                    <option value="PDF">PDF</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Tags filter */}
                <div className="space-y-1">
                  <label className="text-muted-foreground">Match Tag:</label>
                  <input
                    type="text"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    placeholder="e.g. algorithms"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs focus-visible:outline-hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Searches panel */}
          {recentSearches.length > 0 && (
            <Card className="border border-border">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-purple-600" /> Recent
                  Queries
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardHeader>
              <CardContent className="pt-1.5 space-y-1 text-xs">
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(s);
                      handleSearch(undefined, s);
                    }}
                    className="w-full text-left py-1.5 px-2 rounded hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    {s}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Search Bar & Results Area */}
        <div className="lg:col-span-3 space-y-6">
          <form
            onSubmit={(e) => {
              handleSearch(e);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a conceptual query, e.g. 'explain TCP congestion control dynamics'..."
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm shadow-xs focus-visible:outline-hidden"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs px-4"
            >
              {isPending ? 'Searching...' : 'Semantic search'}
            </Button>
          </form>

          {isPending ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="border border-border animate-pulse">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-1/3 bg-muted rounded" />
                      <div className="h-4 w-12 bg-muted rounded" />
                    </div>
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-5/6 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
                <span>Vector match results (ordered by cosine distance)</span>
                <span>Found {results.length} matched items</span>
              </div>

              {results.map((res) => (
                <Card
                  key={res.id}
                  className="border border-border hover:border-purple-600/30 transition-all duration-300 shadow-2xs hover:shadow-xs"
                >
                  <CardContent className="p-5 space-y-3">
                    {/* Path & Badge row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground truncate">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase flex items-center gap-1 ${getSourceBadgeColor(
                            res.sourceType
                          )}`}
                        >
                          {getSourceIcon(res.sourceType)}
                          {res.sourceType}
                        </span>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        <span className="truncate">{res.breadcrumbPath}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${getScoreBadgeColor(
                          res.similarityScore
                        )}`}
                      >
                        {Math.round(res.similarityScore * 100)}% match
                      </span>
                    </div>

                    {/* Result Content */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-foreground hover:text-purple-600 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {res.contentPreview}
                      </p>
                    </div>

                    {/* Tags row */}
                    {res.matchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {res.matchedTags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[9px] font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query.trim() ? (
            <EmptyState
              icon={<Search className="h-8 w-8 text-rose-500 animate-bounce" />}
              title="No matched items found"
              description="No content exceeded your similarity threshold limit. Try shifting the slider down or clearing category filters."
            />
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8 text-purple-600" />}
              title="Semantic Search Console"
              description="Enter a query, choose vector thresholds, and retrieve relevant chunks dynamically across your notes, resources, and curriculum maps."
            />
          )}
        </div>
      </div>
    </div>
  );
}
