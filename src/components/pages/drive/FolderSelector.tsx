import React, { useState } from 'react';
import { client_q } from '~/api/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Folder, ChevronRight, Home } from 'lucide-react';
import { toast } from 'sonner';

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
}

interface FolderSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string | null, folderName: string) => void;
  title: string;
  description: string;
  excludeFolderId?: string; // Folder to exclude from selection (for move operations)
}

export function FolderSelector({
  isOpen,
  onClose,
  onSelect,
  title,
  description,
  excludeFolderId
}: FolderSelectorProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [breadcrumbPath, setBreadcrumbPath] = useState<{ id?: string; name: string }[]>([
    { name: 'My Drive' }
  ]);

  const { data: folderData, isLoading } = client_q.files.list_files.useQuery(
    { folder_id: currentFolderId },
    { enabled: isOpen }
  );

  const handleFolderOpen = (folderId: string, folderName: string) => {
    if (folderId === excludeFolderId) {
      toast.error('Cannot select the same folder');
      return;
    }

    setCurrentFolderId(folderId);
    setBreadcrumbPath((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbNavigation = (targetIndex: number) => {
    const newPath = breadcrumbPath.slice(0, targetIndex + 1);
    setBreadcrumbPath(newPath);

    if (targetIndex === 0) {
      setCurrentFolderId(undefined);
    } else {
      const targetFolder = newPath[targetIndex];
      setCurrentFolderId(targetFolder.id);
    }
  };

  const handleSelect = () => {
    const currentFolderName = breadcrumbPath[breadcrumbPath.length - 1]?.name || 'My Drive';
    onSelect(currentFolderId || null, currentFolderName);
    onClose();
  };

  const handleClose = () => {
    // Reset to root when closing
    setCurrentFolderId(undefined);
    setBreadcrumbPath([{ name: 'My Drive' }]);
    onClose();
  };

  // Filter out excluded folder and its children
  const availableFolders =
    folderData?.folders.filter((folder) => {
      if (excludeFolderId && folder.id === excludeFolderId) {
        return false;
      }
      // For now, we're only excluding direct matches
      // Could be extended to exclude nested folders if needed
      return true;
    }) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[600px] max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumbPath.map((path, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => handleBreadcrumbNavigation(index)}
                  className="flex items-center space-x-1 transition-colors hover:text-foreground"
                >
                  {index === 0 ? <Home className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                  <span>{path.name}</span>
                </button>
                {index < breadcrumbPath.length - 1 && <ChevronRight className="h-4 w-4" />}
              </React.Fragment>
            ))}
          </div>

          {/* Folder List */}
          <div className="max-h-[300px] overflow-y-auto rounded-lg border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading folders...</div>
            ) : availableFolders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No folders in this location
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {availableFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="cursor-pointer border-none shadow-none transition-all hover:bg-muted/50 hover:shadow-sm"
                    onClick={() => handleFolderOpen(folder.id, folder.name)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Folder className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{folder.name}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Current Selection */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium">Selected destination:</p>
            <p className="text-sm text-muted-foreground">
              {breadcrumbPath.map((path) => path.name).join(' / ')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>Select This Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
