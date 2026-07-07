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
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/common';
import { ResourceForm } from '@/components/forms/ResourceForm';
import { Resource, CreateResourceInput } from '@aelpt/shared';

export default function ResourcesPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Stores
  const { resources, addResource, updateResource, deleteResource } =
    useNotesMockStore();
  const { subjects, topics } = useAcademicMockStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

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
    return matchesSearch && matchesSubject && matchesCat;
  });

  // Handlers
  const handleOpenCreateResource = () => {
    setEditingResource(null);
    setIsResourceDialogOpen(true);
  };

  const handleOpenEditResource = (res: Resource) => {
    setEditingResource(res);
    setIsResourceDialogOpen(true);
  };

  const handleResourceSubmit = (data: CreateResourceInput) => {
    if (editingResource) {
      updateResource(editingResource.id, data);
    } else {
      addResource(data);
    }
    setIsResourceDialogOpen(false);
  };

  const handleConfirmDeleteResource = () => {
    if (deletingResourceId) {
      deleteResource(deletingResourceId);
      setDeletingResourceId(null);
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
        subtitle="Save study guides, textbook chapters, video tutorials, and syllabus links."
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

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="text-xs font-semibold h-8 border border-input rounded-md bg-transparent px-2.5"
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
            className="text-xs font-semibold h-8 border border-input rounded-md bg-transparent px-2.5"
          >
            <option value="ALL">All Categories</option>
            <option value="WEBSITE">Website</option>
            <option value="BOOK">Book</option>
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-8 w-8" />}
          title={
            searchQuery || filterSubjectId !== 'ALL' || filterCategory !== 'ALL'
              ? 'No resources matched'
              : 'No resources saved yet'
          }
          description={
            searchQuery || filterSubjectId !== 'ALL' || filterCategory !== 'ALL'
              ? 'Try adjusting your search criteria or categories.'
              : 'Add online course references, tutorials, and materials to start building your resources library.'
          }
          {...(searchQuery ||
          filterSubjectId !== 'ALL' ||
          filterCategory !== 'ALL'
            ? {}
            : {
                action: {
                  label: 'Add Resource',
                  onClick: handleOpenCreateResource,
                },
              })}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filteredResources.map((res) => {
            const sub = subjects.find((s) => s.id === res.subjectId);
            const topic = topics.find((t) => t.id === res.topicId);
            return (
              <Card
                key={res.id}
                className="border border-border bg-card flex flex-col justify-between shadow-2xs hover:shadow-xs group transition-shadow"
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
                      <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                        <span className="truncate">{res.title}</span>
                        {res.url && (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:opacity-85 shrink-0"
                            title="Open Link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </h3>
                    </div>

                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEditResource(res)}
                        aria-label="Edit Resource"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingResourceId(res.id)}
                        aria-label="Delete Resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-2 text-xs text-muted-foreground leading-relaxed">
                  {res.description ? (
                    <p className="line-clamp-3">{res.description}</p>
                  ) : (
                    <p className="italic text-zinc-500">
                      No synopsis description provided.
                    </p>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-border bg-muted/10 rounded-b-xl px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Linked topic: {topic ? topic.title : 'None'}</span>
                  <span>
                    Saved {new Date(res.createdAt).toLocaleDateString()}
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE/EDIT RESOURCE DIALOG */}
      <Dialog
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource' : 'Add Study Resource'}
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
        description="Are you sure you want to permanently delete this resource? This action cannot be undone."
        onConfirm={handleConfirmDeleteResource}
      />
    </div>
  );
}
