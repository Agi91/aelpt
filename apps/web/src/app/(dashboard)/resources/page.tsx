'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Globe,
  Trash2,
  Edit2,
  Bookmark,
  Star,
  UploadCloud,
  File,
  RotateCw,
} from 'lucide-react';
import { useNotesMockStore } from '@/store/useNotesMockStore';
import { useAcademicMockStore } from '@/store/useAcademicMockStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PageHeader,
  EmptyState,
  SectionHeader,
  ConfirmDialog,
  StatCard,
} from '@/components/common';
import { ResourceForm } from '@/components/forms/ResourceForm';
import { Resource, CreateResourceInput } from '@aelpt/shared';
import { toast } from 'sonner';

type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'TITLE_ASC' | 'TITLE_DESC';
type FilterSegment = 'ALL' | 'BOOKMARKS' | 'FAVORITES';

export default function ResourcesPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Stores
  const {
    resources,
    addResource,
    updateResource,
    deleteResource,
    toggleBookmarkResource,
    toggleFavoriteResource,
    markResourceViewed,
    addMockFileAttachment,
  } = useNotesMockStore();

  const { subjects, topics } = useAcademicMockStore();

  // Search, Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<FilterSegment>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');

  // Drag & Drop simulation state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modals
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Resources"
          subtitle="Save and organize syllabus links, PDFs, and videos."
        />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="h-40 border border-border bg-card rounded-2xl animate-pulse" />
          <div className="h-40 border border-border bg-card rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Collect all unique tags across all resources
  const allTags = Array.from(
    new Set(resources.flatMap((res) => res.tags || []))
  );

  // Filtered list
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description &&
        res.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      filterSubjectId === 'ALL' || res.subjectId === filterSubjectId;
    const matchesCat =
      filterCategory === 'ALL' || res.category === filterCategory;
    const matchesTag =
      selectedTag === 'ALL' || (res.tags && res.tags.includes(selectedTag));

    let matchesSegment = true;
    if (selectedSegment === 'BOOKMARKS') matchesSegment = res.isBookmarked;
    if (selectedSegment === 'FAVORITES') matchesSegment = res.isFavorite;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesCat &&
      matchesTag &&
      matchesSegment
    );
  });

  // Sorted list
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title);
    if (sortBy === 'TITLE_DESC') return b.title.localeCompare(a.title);
    if (sortBy === 'DATE_ASC')
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    // Default DATE_DESC
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Recently Viewed (lastViewedAt is defined, sorted descending)
  const recentlyViewed = resources
    .filter((r) => r.lastViewedAt)
    .sort(
      (a, b) =>
        new Date(b.lastViewedAt!).getTime() -
        new Date(a.lastViewedAt!).getTime()
    )
    .slice(0, 3);

  // Statistics calculation
  const totalCount = resources.length;
  const bookmarkedCount = resources.filter((r) => r.isBookmarked).length;

  // Calculate mock file attachment total size
  const totalFileSizeMb = resources.reduce((acc, curr) => {
    if (!curr.fileSize) return acc;
    const numericSize = parseFloat(curr.fileSize.replace(/[^0-9.]/g, '')) || 0;
    return acc + numericSize;
  }, 0);

  const videoResourcesCount = resources.filter(
    (r) => r.category === 'VIDEO'
  ).length;
  const pdfResourcesCount = resources.filter(
    (r) => r.category === 'PDF'
  ).length;

  // Handlers
  const handleOpenCreateResource = () => {
    setEditingResource(null);
    setIsResourceDialogOpen(true);
  };

  const handleOpenEditResource = (res: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingResource(res);
    setIsResourceDialogOpen(true);
  };

  const handleResourceSubmit = (data: CreateResourceInput) => {
    if (editingResource) {
      updateResource(editingResource.id, data);
      toast.success('Resource updated successfully');
    } else {
      addResource(data);
      toast.success('Resource added successfully');
    }
    setIsResourceDialogOpen(false);
  };

  const handleConfirmDeleteResource = () => {
    if (deletingResourceId) {
      deleteResource(deletingResourceId);
      setDeletingResourceId(null);
      toast.success('Resource deleted successfully');
    }
  };

  // Drag & Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateFileUpload = (
    fileName: string,
    fileSize: string,
    fileType: string
  ) => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            addMockFileAttachment(fileName, fileSize, fileType);
            setIsUploading(false);
            setIsDragging(false);
            toast.success(`Mock file "${fileName}" attached successfully!`);
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      const file = files[0];
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      simulateFileUpload(file.name, sizeStr, file.type || 'application/pdf');
    } else {
      // Fallback fallback simulator
      simulateFileUpload('syllabus_handout.pdf', '2.4 MB', 'application/pdf');
    }
  };

  const triggerMockUpload = () => {
    const mockFiles = [
      { name: 'dsa_cheatsheet.pdf', size: '1.8 MB', type: 'application/pdf' },
      {
        name: 'normalization_steps.docx',
        size: '0.9 MB',
        type: 'application/vnd.openxmlformats-officedocument',
      },
      {
        name: 'virtual_memory_paging.pdf',
        size: '3.1 MB',
        type: 'application/pdf',
      },
    ];
    const pick = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    if (pick) {
      simulateFileUpload(pick.name, pick.size, pick.type);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BOOK':
        return (
          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        );
      case 'VIDEO':
        return <Video className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'PDF':
        return (
          <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        );
      default:
        return <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'BOOK':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'VIDEO':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'PDF':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Manager"
        subtitle="Manage lecture notes, reference books, tutorials, and local file attachments."
        actions={
          <Button
            onClick={handleOpenCreateResource}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Resource
          </Button>
        }
      />

      {/* Resource Statistics Widgets */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Resources"
          value={`${totalCount} entries`}
          subtitle="Overall library count"
          icon={<Globe className="h-4 w-4" />}
          accent="bg-purple-600/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Bookmarks"
          value={`${bookmarkedCount} saved`}
          subtitle="Bookmarked references"
          icon={<Bookmark className="h-4 w-4" />}
          accent="bg-amber-600/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Attached Files"
          value={`${totalFileSizeMb.toFixed(1)} MB`}
          subtitle="Mock file storage utilized"
          icon={<FileText className="h-4 w-4" />}
          accent="bg-blue-600/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Videos / PDFs"
          value={`${videoResourcesCount}v / ${pdfResourcesCount}p`}
          subtitle="Resource format distribution"
          icon={<Video className="h-4 w-4" />}
          accent="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Main Grid: Left Filters, Upload Zone & Recents / Right Resource Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: upload drop-zone & sidebar widgets */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mock Drag & Drop Upload Zone */}
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-dashed border-2 p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-purple-600 bg-purple-500/5'
                : 'border-border bg-card/60 hover:bg-muted/10'
            }`}
            onClick={triggerMockUpload}
          >
            <CardContent className="flex flex-col items-center justify-center space-y-3 pt-4">
              {isUploading ? (
                <>
                  <RotateCw className="h-8 w-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-foreground">
                    Uploading mock attachment ({uploadProgress}%)
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-purple-600" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      Drag & drop files here
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      or click to simulate mock file attachment
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recently Viewed Resources */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <SectionHeader title="Recently Viewed" className="mb-0 text-xs" />
            </CardHeader>
            <CardContent className="space-y-2">
              {recentlyViewed.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No recently viewed logs.
                </p>
              ) : (
                recentlyViewed.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border bg-card/50 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {res.title}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {res.category}
                      </p>
                    </div>
                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-purple-600"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <File className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tags cloud */}
          {allTags.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <SectionHeader title="Tags Filter" className="mb-0 text-xs" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                <Button
                  variant={selectedTag === 'ALL' ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setSelectedTag('ALL')}
                  className="text-[9px] h-6 px-2.5 rounded-full"
                >
                  All Tags
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    size="xs"
                    onClick={() => setSelectedTag(tag)}
                    className="text-[9px] h-6 px-2.5 rounded-full"
                  >
                    #{tag}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Advanced Filter Bars & Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Advanced Filtering controls */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={filterSubjectId}
                    onChange={(e) => setFilterSubjectId(e.target.value)}
                    className="text-[10px] font-semibold h-7 border border-input rounded-md bg-transparent px-2"
                  >
                    <option value="ALL">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-[10px] font-semibold h-7 border border-input rounded-md bg-transparent px-2"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="WEBSITE">Website</option>
                    <option value="BOOK">Book</option>
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="OTHER">Other</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-[10px] font-semibold h-7 border border-input rounded-md bg-transparent px-2"
                  >
                    <option value="DATE_DESC">Newest First</option>
                    <option value="DATE_ASC">Oldest First</option>
                    <option value="TITLE_ASC">Title A-Z</option>
                    <option value="TITLE_DESC">Title Z-A</option>
                  </select>
                </div>

                {/* Segment tab toggle */}
                <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border text-[10px] font-bold select-none shrink-0">
                  <button
                    onClick={() => setSelectedSegment('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedSegment === 'ALL'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedSegment('BOOKMARKS')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedSegment === 'BOOKMARKS'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Bookmarked
                  </button>
                  <button
                    onClick={() => setSelectedSegment('FAVORITES')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedSegment === 'FAVORITES'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Starred
                  </button>
                </div>
              </div>

              {/* Main Search Row */}
              <div className="pt-2 relative">
                <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {sortedResources.length === 0 ? (
                <EmptyState
                  icon={<Globe className="h-6 w-6" />}
                  title="No resources found"
                  description="Try adjusting your queries, categories, or segment filters."
                />
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {sortedResources.map((res) => {
                    const sub = subjects.find((s) => s.id === res.subjectId);
                    const topic = topics.find((t) => t.id === res.topicId);
                    return (
                      <Card
                        key={res.id}
                        onClick={() => markResourceViewed(res.id)}
                        className="group border border-border bg-card hover:bg-muted/5 flex flex-col justify-between shadow-2xs hover:shadow-xs cursor-pointer transition-all"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getCategoryClass(res.category)}`}
                                >
                                  {getCategoryIcon(res.category)}
                                  {res.category}
                                </span>
                                {sub && (
                                  <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase">
                                    {sub.code || sub.name.slice(0, 10)}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                <span className="truncate">{res.title}</span>
                                {res.url && (
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 dark:text-purple-400 hover:opacity-85 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </h3>
                            </div>

                            {/* Resource Card Action Buttons */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmarkResource(res.id);
                                }}
                                title={
                                  res.isBookmarked
                                    ? 'Remove Bookmark'
                                    : 'Bookmark'
                                }
                              >
                                <Bookmark
                                  className={`h-3.5 w-3.5 ${res.isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteResource(res.id);
                                }}
                                title={
                                  res.isFavorite ? 'Unfavorite' : 'Favorite'
                                }
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${res.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => handleOpenEditResource(res, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingResourceId(res.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="py-2 text-xs text-muted-foreground leading-relaxed space-y-2">
                          <p className="line-clamp-2">
                            {res.description ||
                              'No description synopsis provided.'}
                          </p>

                          {/* Display Tags */}
                          {res.tags && res.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {res.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[8px] bg-muted/60 text-muted-foreground px-1.5 py-0.2 rounded-full font-bold"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* File detail badge */}
                          {res.fileSize && (
                            <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-lg border border-border text-[9px] font-bold text-foreground max-w-max">
                              <File className="h-3 w-3 text-purple-600" />
                              <span>
                                {res.fileSize} (
                                {res.fileType?.split('/')[1]?.toUpperCase() ||
                                  'Attachment'}
                                )
                              </span>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-2 border-t border-border bg-muted/10 rounded-b-xl px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Topic: {topic ? topic.title : 'None'}</span>
                          <span>
                            Saved {new Date(res.createdAt).toLocaleDateString()}
                          </span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CREATE/EDIT RESOURCE DIALOG */}
      <Dialog
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource' : 'Add Reference Resource'}
            </DialogTitle>
          </DialogHeader>
          <ResourceForm
            subjects={subjects}
            topics={topics}
            {...(editingResource ? { initialValues: editingResource } : {})}
            onSubmit={handleResourceSubmit}
            onCancel={() => setIsResourceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE RESOURCE */}
      <ConfirmDialog
        isOpen={deletingResourceId !== null}
        onClose={() => setDeletingResourceId(null)}
        title="Delete Reference Resource?"
        description="Are you sure you want to permanently delete this reference resource? This action cannot be undone."
        onConfirm={handleConfirmDeleteResource}
      />
    </div>
  );
}
