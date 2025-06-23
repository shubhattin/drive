'use client';

import { useState, useEffect } from 'react';
import { client_q } from '~/api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionReset: () => void;
  item: {
    id: string;
    name: string;
    type: 'file' | 'folder';
  } | null;
  currentFolderId?: string;
}

export function RenameDialog({
  isOpen,
  onClose,
  onSelectionReset,
  item,
  currentFolderId
}: RenameDialogProps) {
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const utils = client_q.useUtils();

  const renameFileMutation = client_q.files.rename_file.useMutation({
    onSuccess: (data) => {
      toast.success(`File renamed to "${data.name}" successfully`);
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to rename file: ${error.message}`);
      setIsRenaming(false);
    }
  });

  const renameFolderMutation = client_q.files.rename_folder.useMutation({
    onSuccess: (data) => {
      toast.success(`Folder renamed to "${data.name}" successfully`);
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      onSelectionReset();
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to rename folder: ${error.message}`);
      setIsRenaming(false);
    }
  });

  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !newName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    if (newName.trim() === item.name) {
      handleClose();
      return;
    }

    setIsRenaming(true);

    try {
      if (item.type === 'file') {
        await renameFileMutation.mutateAsync({
          file_id: item.id,
          new_name: newName.trim()
        });
      } else {
        await renameFolderMutation.mutateAsync({
          folder_id: item.id,
          new_name: newName.trim()
        });
      }
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleClose = () => {
    setNewName('');
    setIsRenaming(false);
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Rename {item.type}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">{item.type === 'file' ? 'File Name' : 'Folder Name'}</Label>
            <Input
              id="item-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Enter ${item.type} name`}
              disabled={isRenaming}
              autoFocus
              onFocus={(e) => {
                // Select the name part without extension for files
                if (item.type === 'file') {
                  const lastDotIndex = e.target.value.lastIndexOf('.');
                  if (lastDotIndex > 0) {
                    e.target.setSelectionRange(0, lastDotIndex);
                  } else {
                    e.target.select();
                  }
                } else {
                  e.target.select();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isRenaming}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRenaming || !newName.trim() || newName.trim() === item.name}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
