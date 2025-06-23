'use client';

import { useState } from 'react';
import { client_q } from '~/api/client';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Card, CardContent } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog';
import { getFileIcon } from './FileIcons';
import { formatFileSize, formatDate } from './utils';
import {
  MoreHorizontal,
  Download,
  Edit,
  Copy,
  Move,
  Trash2,
  Folder,
  Grid3x3,
  List
} from 'lucide-react';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  folderId: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
}

interface FileListProps {
  files: FileItem[];
  folders: FolderItem[];
  selectedItems: Set<string>;
  onSelectionChange: (items: Set<string>) => void;
  onFolderOpen: (folderId: string) => void;
  currentFolderId?: string;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function FileList({
  files,
  folders,
  selectedItems,
  onSelectionChange,
  onFolderOpen,
  currentFolderId,
  viewMode,
  onViewModeChange
}: FileListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'file' | 'folder';
  } | null>(null);

  const utils = client_q.useUtils();

  const deleteFileMutation = client_q.files.delete_file.useMutation({
    onSuccess: () => {
      toast.success('File deleted successfully');
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
    },
    onError: (error) => {
      toast.error(`Failed to delete file: ${error.message}`);
    }
  });

  const downloadFileMutation = client_q.files.get_download_url.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    },
    onError: (error) => {
      toast.error(`Failed to download file: ${error.message}`);
    }
  });

  const handleSelectItem = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allItems = [...files.map((f) => f.id), ...folders.map((f) => f.id)];
    if (selectedItems.size === allItems.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allItems));
    }
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setItemToDelete({ id: fileId, name: fileName, type: 'file' });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && itemToDelete.type === 'file') {
      deleteFileMutation.mutate({ file_id: itemToDelete.id });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDownload = (fileId: string) => {
    downloadFileMutation.mutate({ file_id: fileId });
  };

  if (files.length === 0 && folders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Folder className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-muted-foreground">No files or folders</h3>
            <p className="text-sm text-muted-foreground">
              Upload files or create folders to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {(files.length > 0 || folders.length > 0) && (
            <Checkbox
              checked={selectedItems.size === files.length + folders.length}
              onCheckedChange={handleSelectAll}
              aria-label="Select all items"
            />
          )}
          <span className="text-sm text-muted-foreground">
            {files.length + folders.length} item(s)
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {/* Folders */}
          {folders.map((folder) => (
            <FileGridItem
              key={`folder-${folder.id}`}
              id={folder.id}
              name={folder.name}
              type="folder"
              size={0}
              createdAt={folder.createdAt}
              selected={selectedItems.has(folder.id)}
              onSelect={handleSelectItem}
              onOpen={() => onFolderOpen(folder.id)}
              onDownload={() => {}}
              onDelete={() => {}}
            />
          ))}
          {/* Files */}
          {files.map((file) => (
            <FileGridItem
              key={`file-${file.id}`}
              id={file.id}
              name={file.name}
              type="file"
              mimeType={file.mimeType}
              size={file.size}
              createdAt={file.createdAt}
              selected={selectedItems.has(file.id)}
              onSelect={handleSelectItem}
              onOpen={() => handleDownload(file.id)}
              onDownload={() => handleDownload(file.id)}
              onDelete={() => handleDeleteFile(file.id, file.name)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Folders */}
          {folders.map((folder) => (
            <FileListItem
              key={`folder-${folder.id}`}
              id={folder.id}
              name={folder.name}
              type="folder"
              size={0}
              createdAt={folder.createdAt}
              selected={selectedItems.has(folder.id)}
              onSelect={handleSelectItem}
              onOpen={() => onFolderOpen(folder.id)}
              onDownload={() => {}}
              onDelete={() => {}}
            />
          ))}
          {/* Files */}
          {files.map((file) => (
            <FileListItem
              key={`file-${file.id}`}
              id={file.id}
              name={file.name}
              type="file"
              mimeType={file.mimeType}
              size={file.size}
              createdAt={file.createdAt}
              selected={selectedItems.has(file.id)}
              onSelect={handleSelectItem}
              onOpen={() => handleDownload(file.id)}
              onDownload={() => handleDownload(file.id)}
              onDelete={() => handleDeleteFile(file.id, file.name)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface FileItemProps {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: number;
  createdAt: Date;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function FileGridItem({
  id,
  name,
  type,
  mimeType,
  size,
  createdAt,
  selected,
  onSelect,
  onOpen,
  onDownload,
  onDelete
}: FileItemProps) {
  const icon =
    type === 'folder' ? (
      <Folder className="h-8 w-8 text-blue-500" />
    ) : (
      getFileIcon(mimeType || '', 'w-8 h-8')
    );

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect(id)}
              onClick={(e) => e.stopPropagation()}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {type === 'file' && (
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Move className="mr-2 h-4 w-4" />
                  Move
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col items-center space-y-2 text-center" onClick={onOpen}>
            {icon}
            <div className="w-full">
              <p className="truncate text-sm font-medium" title={name}>
                {name}
              </p>
              {type === 'file' && (
                <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileListItem({
  id,
  name,
  type,
  mimeType,
  size,
  createdAt,
  selected,
  onSelect,
  onOpen,
  onDownload,
  onDelete
}: FileItemProps) {
  const icon =
    type === 'folder' ? (
      <Folder className="h-6 w-6 text-blue-500" />
    ) : (
      getFileIcon(mimeType || '', 'w-6 h-6')
    );

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-sm ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(id)}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex min-w-0 flex-1 items-center space-x-3" onClick={onOpen}>
            {icon}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
            </div>
          </div>

          {type === 'file' && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{formatFileSize(size)}</p>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {type === 'file' && (
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Move className="mr-2 h-4 w-4" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
