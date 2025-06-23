'use client';

import React, { useState, useCallback } from 'react';
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
import { RenameDialog } from './RenameDialog';
import { FolderSelector } from './FolderSelector';
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
  onSelectionReset: () => void;
  onFolderOpen: (folderId: string, folderName: string) => void;
  currentFolderId?: string;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  bulkDeleteTrigger?: number;
  bulkCopyTrigger?: number;
  bulkMoveTrigger?: number;
}

export function FileList({
  files,
  folders,
  selectedItems,
  onSelectionChange,
  onSelectionReset,
  onFolderOpen,
  currentFolderId,
  viewMode,
  onViewModeChange,
  bulkDeleteTrigger,
  bulkCopyTrigger,
  bulkMoveTrigger
}: FileListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'file' | 'folder' | 'bulk';
    selectedFiles?: FileItem[];
    selectedFolders?: FolderItem[];
  } | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{
    id: string;
    name: string;
    type: 'file' | 'folder';
  } | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [itemToCopyOrMove, setItemToCopyOrMove] = useState<{
    id: string;
    name: string;
    type: 'file' | 'folder' | 'bulk';
    selectedFiles?: FileItem[];
    selectedFolders?: FolderItem[];
  } | null>(null);

  const utils = client_q.useUtils();

  const deleteFileMutation = client_q.files.delete_file.useMutation({
    onSuccess: () => {
      // Only show toast for individual deletions (not bulk)
      if (!itemToDelete || itemToDelete.type !== 'bulk') {
        toast.success('File deleted successfully');
      }
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
    },
    onError: (error) => {
      // Only show toast for individual deletions (not bulk)
      if (!itemToDelete || itemToDelete.type !== 'bulk') {
        toast.error(`Failed to delete file: ${error.message}`);
      }
    }
  });

  const deleteFolderMutation = client_q.files.delete_folder.useMutation({
    onSuccess: () => {
      // Only show toast for individual deletions (not bulk)
      if (!itemToDelete || itemToDelete.type !== 'bulk') {
        toast.success('Folder deleted successfully');
      }
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
    },
    onError: (error) => {
      // Only show toast for individual deletions (not bulk)
      if (!itemToDelete || itemToDelete.type !== 'bulk') {
        toast.error(`Failed to delete folder: ${error.message}`);
      }
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

  const copyFileMutation = client_q.files.copy_file.useMutation({
    onSuccess: () => {
      toast.success('File copied successfully');
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
    },
    onError: (error) => {
      toast.error(`Failed to copy file: ${error.message}`);
    }
  });

  const moveFileMutation = client_q.files.move_file.useMutation({
    onSuccess: () => {
      toast.success('File moved successfully');
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
    },
    onError: (error) => {
      toast.error(`Failed to move file: ${error.message}`);
    }
  });

  const copyFolderMutation = client_q.files.copy_folder.useMutation({
    onSuccess: () => {
      toast.success('Folder copied successfully');
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
    },
    onError: (error) => {
      toast.error(`Failed to copy folder: ${error.message}`);
    }
  });

  const moveFolderMutation = client_q.files.move_folder.useMutation({
    onSuccess: () => {
      toast.success('Folder moved successfully');
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
    },
    onError: (error) => {
      toast.error(`Failed to move folder: ${error.message}`);
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

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setItemToDelete({ id: folderId, name: folderName, type: 'folder' });
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.size === 0) return;

    // Get details of selected items
    const selectedFiles = files.filter((f) => selectedItems.has(f.id));
    const selectedFolders = folders.filter((f) => selectedItems.has(f.id));

    const fileCount = selectedFiles.length;
    const folderCount = selectedFolders.length;

    let itemName = '';
    if (fileCount > 0 && folderCount > 0) {
      itemName = `${fileCount} file(s) and ${folderCount} folder(s)`;
    } else if (fileCount > 0) {
      itemName = `${fileCount} file(s)`;
    } else {
      itemName = `${folderCount} folder(s)`;
    }

    setItemToDelete({
      id: 'bulk',
      name: itemName,
      type: 'bulk' as any,
      selectedFiles,
      selectedFolders
    } as any);
    setDeleteDialogOpen(true);
  }, [selectedItems, files, folders]);

  // Trigger bulk delete when bulkDeleteTrigger changes
  React.useEffect(() => {
    if (bulkDeleteTrigger && bulkDeleteTrigger > 0) {
      handleBulkDelete();
    }
  }, [bulkDeleteTrigger]); // Removed handleBulkDelete from dependencies to prevent infinite loop

  const handleRenameFile = (fileId: string, fileName: string) => {
    setItemToRename({ id: fileId, name: fileName, type: 'file' });
    setRenameDialogOpen(true);
  };

  const handleRenameFolder = (folderId: string, folderName: string) => {
    setItemToRename({ id: folderId, name: folderName, type: 'folder' });
    setRenameDialogOpen(true);
  };

  const handleCopyFile = (fileId: string, fileName: string) => {
    setItemToCopyOrMove({ id: fileId, name: fileName, type: 'file' });
    setCopyDialogOpen(true);
  };

  const handleMoveFile = (fileId: string, fileName: string) => {
    setItemToCopyOrMove({ id: fileId, name: fileName, type: 'file' });
    setMoveDialogOpen(true);
  };

  const handleCopyFolder = (folderId: string, folderName: string) => {
    setItemToCopyOrMove({ id: folderId, name: folderName, type: 'folder' });
    setCopyDialogOpen(true);
  };

  const handleMoveFolder = (folderId: string, folderName: string) => {
    setItemToCopyOrMove({ id: folderId, name: folderName, type: 'folder' });
    setMoveDialogOpen(true);
  };

  const confirmCopy = async (targetFolderId: string | null, targetFolderName: string) => {
    if (!itemToCopyOrMove) return;

    try {
      if (itemToCopyOrMove.type === 'file') {
        await copyFileMutation.mutateAsync({
          file_id: itemToCopyOrMove.id,
          target_folder_id: targetFolderId
        });
        toast.success(`File copied to ${targetFolderName}`);
      } else if (itemToCopyOrMove.type === 'folder') {
        await copyFolderMutation.mutateAsync({
          folder_id: itemToCopyOrMove.id,
          target_folder_id: targetFolderId
        });
        toast.success(`Folder copied to ${targetFolderName}`);
      } else if (itemToCopyOrMove.type === 'bulk') {
        // Handle bulk copy using Promise.all for simultaneous copying
        const copyPromises: Promise<any>[] = [];
        let totalCount = 0;

        // Add file copy promises
        if (itemToCopyOrMove.selectedFiles) {
          totalCount += itemToCopyOrMove.selectedFiles.length;
          itemToCopyOrMove.selectedFiles.forEach((file) => {
            copyPromises.push(
              copyFileMutation
                .mutateAsync({
                  file_id: file.id,
                  target_folder_id: targetFolderId
                })
                .catch((error) => {
                  console.error(`Failed to copy file ${file.name}:`, error);
                  return { error: true, name: file.name, type: 'file' };
                })
            );
          });
        }

        // Add folder copy promises
        if (itemToCopyOrMove.selectedFolders) {
          totalCount += itemToCopyOrMove.selectedFolders.length;
          itemToCopyOrMove.selectedFolders.forEach((folder) => {
            copyPromises.push(
              copyFolderMutation
                .mutateAsync({
                  folder_id: folder.id,
                  target_folder_id: targetFolderId
                })
                .catch((error) => {
                  console.error(`Failed to copy folder ${folder.name}:`, error);
                  return { error: true, name: folder.name, type: 'folder' };
                })
            );
          });
        }

        // Execute all copies simultaneously
        const results = await Promise.all(copyPromises);

        // Count successes and failures
        const failedItems = results.filter((result) => result && result.error);
        const successCount = totalCount - failedItems.length;

        // Clear selection after bulk copy
        onSelectionChange(new Set());

        // Show appropriate success/error message
        if (successCount === totalCount) {
          toast.success(`Successfully copied ${successCount} item(s) to ${targetFolderName}`);
        } else if (successCount > 0) {
          toast.warning(
            `Copied ${successCount} of ${totalCount} item(s) to ${targetFolderName}. Some items could not be copied.`
          );
        } else {
          toast.error('Failed to copy items');
        }
      }
    } catch (error) {
      // Error handling is done in the mutation
    }

    setCopyDialogOpen(false);
    setItemToCopyOrMove(null);
  };

  const confirmMove = async (targetFolderId: string | null, targetFolderName: string) => {
    if (!itemToCopyOrMove) return;

    try {
      if (itemToCopyOrMove.type === 'file') {
        await moveFileMutation.mutateAsync({
          file_id: itemToCopyOrMove.id,
          target_folder_id: targetFolderId
        });
        toast.success(`File moved to ${targetFolderName}`);
      } else if (itemToCopyOrMove.type === 'folder') {
        await moveFolderMutation.mutateAsync({
          folder_id: itemToCopyOrMove.id,
          target_folder_id: targetFolderId
        });
        toast.success(`Folder moved to ${targetFolderName}`);
      } else if (itemToCopyOrMove.type === 'bulk') {
        // Handle bulk move using Promise.all for simultaneous moving
        const movePromises: Promise<any>[] = [];
        let totalCount = 0;

        // Add file move promises
        if (itemToCopyOrMove.selectedFiles) {
          totalCount += itemToCopyOrMove.selectedFiles.length;
          itemToCopyOrMove.selectedFiles.forEach((file) => {
            movePromises.push(
              moveFileMutation
                .mutateAsync({
                  file_id: file.id,
                  target_folder_id: targetFolderId
                })
                .catch((error) => {
                  console.error(`Failed to move file ${file.name}:`, error);
                  return { error: true, name: file.name, type: 'file' };
                })
            );
          });
        }

        // Add folder move promises
        if (itemToCopyOrMove.selectedFolders) {
          totalCount += itemToCopyOrMove.selectedFolders.length;
          itemToCopyOrMove.selectedFolders.forEach((folder) => {
            movePromises.push(
              moveFolderMutation
                .mutateAsync({
                  folder_id: folder.id,
                  target_folder_id: targetFolderId
                })
                .catch((error) => {
                  console.error(`Failed to move folder ${folder.name}:`, error);
                  return { error: true, name: folder.name, type: 'folder' };
                })
            );
          });
        }

        // Execute all moves simultaneously
        const results = await Promise.all(movePromises);

        // Count successes and failures
        const failedItems = results.filter((result) => result && result.error);
        const successCount = totalCount - failedItems.length;

        // Clear selection after bulk move
        onSelectionChange(new Set());

        // Show appropriate success/error message
        if (successCount === totalCount) {
          toast.success(`Successfully moved ${successCount} item(s) to ${targetFolderName}`);
        } else if (successCount > 0) {
          toast.warning(
            `Moved ${successCount} of ${totalCount} item(s) to ${targetFolderName}. Some items could not be moved.`
          );
        } else {
          toast.error('Failed to move items');
        }
      }
    } catch (error) {
      // Error handling is done in the mutation
    }

    setMoveDialogOpen(false);
    setItemToCopyOrMove(null);
  };

  const handleBulkCopy = () => {
    if (selectedItems.size === 0) return;

    // Get details of selected items
    const selectedFiles = files.filter((f) => selectedItems.has(f.id));
    const selectedFolders = folders.filter((f) => selectedItems.has(f.id));

    const fileCount = selectedFiles.length;
    const folderCount = selectedFolders.length;

    let itemName = '';
    if (fileCount > 0 && folderCount > 0) {
      itemName = `${fileCount} file(s) and ${folderCount} folder(s)`;
    } else if (fileCount > 0) {
      itemName = `${fileCount} file(s)`;
    } else {
      itemName = `${folderCount} folder(s)`;
    }

    setItemToCopyOrMove({
      id: 'bulk',
      name: itemName,
      type: 'bulk',
      selectedFiles,
      selectedFolders
    });
    setCopyDialogOpen(true);
  };

  const handleBulkMove = () => {
    if (selectedItems.size === 0) return;

    // Get details of selected items
    const selectedFiles = files.filter((f) => selectedItems.has(f.id));
    const selectedFolders = folders.filter((f) => selectedItems.has(f.id));

    const fileCount = selectedFiles.length;
    const folderCount = selectedFolders.length;

    let itemName = '';
    if (fileCount > 0 && folderCount > 0) {
      itemName = `${fileCount} file(s) and ${folderCount} folder(s)`;
    } else if (fileCount > 0) {
      itemName = `${fileCount} file(s)`;
    } else {
      itemName = `${folderCount} folder(s)`;
    }

    setItemToCopyOrMove({
      id: 'bulk',
      name: itemName,
      type: 'bulk',
      selectedFiles,
      selectedFolders
    });
    setMoveDialogOpen(true);
  };

  // Trigger bulk copy when bulkCopyTrigger changes
  React.useEffect(() => {
    if (bulkCopyTrigger && bulkCopyTrigger > 0) {
      handleBulkCopy();
    }
  }, [bulkCopyTrigger]);

  // Trigger bulk move when bulkMoveTrigger changes
  React.useEffect(() => {
    if (bulkMoveTrigger && bulkMoveTrigger > 0) {
      handleBulkMove();
    }
  }, [bulkMoveTrigger]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'file') {
        await deleteFileMutation.mutateAsync({ file_id: itemToDelete.id });
      } else if (itemToDelete.type === 'folder') {
        await deleteFolderMutation.mutateAsync({ folder_id: itemToDelete.id });
      } else if (itemToDelete.type === 'bulk') {
        // Handle bulk deletion using Promise.all for simultaneous deletion
        const deletePromises: Promise<any>[] = [];
        let totalCount = 0;

        // Add file deletion promises
        if (itemToDelete.selectedFiles) {
          totalCount += itemToDelete.selectedFiles.length;
          itemToDelete.selectedFiles.forEach((file) => {
            deletePromises.push(
              deleteFileMutation.mutateAsync({ file_id: file.id }).catch((error) => {
                console.error(`Failed to delete file ${file.name}:`, error);
                return { error: true, name: file.name, type: 'file' };
              })
            );
          });
        }

        // Add folder deletion promises
        if (itemToDelete.selectedFolders) {
          totalCount += itemToDelete.selectedFolders.length;
          itemToDelete.selectedFolders.forEach((folder) => {
            deletePromises.push(
              deleteFolderMutation.mutateAsync({ folder_id: folder.id }).catch((error) => {
                console.error(`Failed to delete folder ${folder.name}:`, error);
                return { error: true, name: folder.name, type: 'folder' };
              })
            );
          });
        }

        // Execute all deletions simultaneously
        const results = await Promise.all(deletePromises);

        // Count successes and failures
        const failedItems = results.filter((result) => result && result.error);
        const successCount = totalCount - failedItems.length;

        // Clear selection after bulk delete
        onSelectionChange(new Set());

        // Show appropriate success/error message
        if (successCount === totalCount) {
          toast.success(`Successfully deleted ${successCount} item(s)`);
        } else if (successCount > 0) {
          toast.warning(
            `Deleted ${successCount} of ${totalCount} item(s). Some items could not be deleted.`
          );
        } else {
          toast.error('Failed to delete items');
        }
      }
    } catch (error) {
      // Error handling is done in the individual mutations
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
              onOpen={() => onFolderOpen(folder.id, folder.name)}
              onDownload={() => {}}
              onDelete={() => handleDeleteFolder(folder.id, folder.name)}
              onRename={() => handleRenameFolder(folder.id, folder.name)}
              onCopy={() => handleCopyFolder(folder.id, folder.name)}
              onMove={() => handleMoveFolder(folder.id, folder.name)}
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
              onRename={() => handleRenameFile(file.id, file.name)}
              onCopy={() => handleCopyFile(file.id, file.name)}
              onMove={() => handleMoveFile(file.id, file.name)}
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
              onOpen={() => onFolderOpen(folder.id, folder.name)}
              onDownload={() => {}}
              onDelete={() => handleDeleteFolder(folder.id, folder.name)}
              onRename={() => handleRenameFolder(folder.id, folder.name)}
              onCopy={() => handleCopyFolder(folder.id, folder.name)}
              onMove={() => handleMoveFolder(folder.id, folder.name)}
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
              onRename={() => handleRenameFile(file.id, file.name)}
              onCopy={() => handleCopyFile(file.id, file.name)}
              onMove={() => handleMoveFile(file.id, file.name)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete?.type === 'bulk'
                ? `Delete ${itemToDelete.name}`
                : `Delete ${itemToDelete?.type}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {itemToDelete?.type === 'bulk'
                ? `Are you sure you want to delete ${itemToDelete.name}?`
                : `Are you sure you want to delete "${itemToDelete?.name}"?`}
              {itemToDelete?.type === 'folder' && (
                <>⚠️ Warning: This will also delete all files and subfolders within this folder.</>
              )}
              {itemToDelete?.type === 'bulk' &&
                itemToDelete.selectedFolders &&
                itemToDelete.selectedFolders.length > 0 && (
                  <>
                    ⚠️ Warning: This includes {itemToDelete.selectedFolders.length} folder(s) and
                    all their contents.
                  </>
                )}
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {itemToDelete?.type === 'bulk' ? 'Delete All' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        onSelectionReset={onSelectionReset}
        item={itemToRename}
        currentFolderId={currentFolderId}
      />

      {/* Copy Dialog */}
      <FolderSelector
        isOpen={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        onSelect={confirmCopy}
        title={itemToCopyOrMove?.type === 'bulk' ? 'Copy Items' : 'Copy Item'}
        description={
          itemToCopyOrMove?.type === 'bulk'
            ? `Select a destination folder to copy ${itemToCopyOrMove.name}`
            : `Select a destination folder to copy "${itemToCopyOrMove?.name}"`
        }
      />

      {/* Move Dialog */}
      <FolderSelector
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        onSelect={confirmMove}
        title={itemToCopyOrMove?.type === 'bulk' ? 'Move Items' : 'Move Item'}
        description={
          itemToCopyOrMove?.type === 'bulk'
            ? `Select a destination folder to move ${itemToCopyOrMove.name}`
            : `Select a destination folder to move "${itemToCopyOrMove?.name}"`
        }
        excludeFolderId={currentFolderId}
      />
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
  onRename: () => void;
  onCopy: () => void;
  onMove: () => void;
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
  onDelete,
  onRename,
  onCopy,
  onMove
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
                <DropdownMenuItem onClick={onRename}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMove}>
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
  onDelete,
  onRename,
  onCopy,
  onMove
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
              <DropdownMenuItem onClick={onRename}>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMove}>
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
