'use client';

import { useState } from 'react';
import { client_q } from '~/api/client';
import { useSession } from '~/lib/auth-client';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { FileList } from '~/components/pages/drive/FileList';
import { FileUpload } from '~/components/pages/drive/FileUpload';
import { UserMenu } from '~/components/pages/drive/UserMenu';
import { BreadcrumbNav } from '~/components/pages/drive/BreadcrumbNav';
import { FolderCreateDialog } from '~/components/pages/drive/FolderCreateDialog';
import { FileListSkeleton } from '~/components/pages/drive/FileListSkeleton';
import { Plus, Upload, FolderPlus, RefreshCw, Trash2, Copy, Move } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

export default function Drive() {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderCreateOpen, setIsFolderCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [breadcrumbPath, setBreadcrumbPath] = useState<{ id?: string; name: string }[]>([
    { name: 'My Drive' }
  ]);
  const [bulkDeleteTrigger, setBulkDeleteTrigger] = useState(0);
  const [bulkCopyTrigger, setBulkCopyTrigger] = useState(0);
  const [bulkMoveTrigger, setBulkMoveTrigger] = useState(0);
  const { data: session } = useSession();

  const utils = client_q.useUtils();

  const {
    data: folderData,
    isFetching,
    error,
    refetch,
    isSuccess 
  } = client_q.files.list_files.useQuery({ folder_id: currentFolderId }, { enabled: !!session });

  const handleRefresh = () => {
    refetch();
    setSelectedItems(new Set()); // Clear selected items on refresh
  };

  const resetSelection = () => {
    setSelectedItems(new Set());
  };

  const handleFolderNavigation = (folderId?: string, folderName?: string) => {
    if (!folderId) {
      // Navigate to root
      setCurrentFolderId(undefined);
      setBreadcrumbPath([{ name: 'My Drive' }]);
    } else {
      // Navigate to folder
      setCurrentFolderId(folderId);
      if (folderName) {
        // Add to breadcrumb path
        setBreadcrumbPath((prev) => [...prev, { id: folderId, name: folderName }]);
      }
    }
  };

  const handleBreadcrumbNavigation = (targetIndex: number) => {
    const newPath = breadcrumbPath.slice(0, targetIndex + 1);
    setBreadcrumbPath(newPath);

    if (targetIndex === 0) {
      // Navigate to root
      setCurrentFolderId(undefined);
    } else {
      // Navigate to specific folder
      const targetFolder = newPath[targetIndex];
      setCurrentFolderId(targetFolder.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">My Drive</h1>
              <BreadcrumbNav
                breadcrumbPath={breadcrumbPath}
                onNavigate={handleBreadcrumbNavigation}
              />
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFolderCreateOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedItems.size > 0 && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.size} item(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkCopyTrigger((prev) => prev + 1)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkMoveTrigger((prev) => prev + 1)}
                >
                  <Move className="mr-2 h-4 w-4" />
                  Move Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteTrigger((prev) => prev + 1)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* File List */}
        {error ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 text-destructive">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-muted-foreground">
                  Error loading files
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
                <Button onClick={handleRefresh} size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isFetching ? (
          <FileListSkeleton viewMode={viewMode} />
        ) : (
          <FileList
            files={folderData?.files || []}
            folders={folderData?.folders || []}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onSelectionReset={resetSelection}
            onFolderOpen={(folderId, folderName) => handleFolderNavigation(folderId, folderName)}
            currentFolderId={currentFolderId}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            bulkDeleteTrigger={bulkDeleteTrigger}
            bulkCopyTrigger={bulkCopyTrigger}
            bulkMoveTrigger={bulkMoveTrigger}
            isFetching={isFetching || !isSuccess}
          />
        )}

        {/* Upload Modal */}
        <FileUpload
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          currentFolderId={currentFolderId}
        />

        {/* Folder Create Dialog */}
        <FolderCreateDialog
          isOpen={isFolderCreateOpen}
          onClose={() => setIsFolderCreateOpen(false)}
          onSelectionReset={resetSelection}
          currentFolderId={currentFolderId}
        />
      </main>
    </div>
  );
}
