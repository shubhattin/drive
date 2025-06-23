'use client';

import { useState } from 'react';
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
import { FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

interface FolderCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: string;
}

export function FolderCreateDialog({ isOpen, onClose, currentFolderId }: FolderCreateDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const utils = client_q.useUtils();

  const createFolderMutation = client_q.files.create_folder.useMutation({
    onSuccess: (data) => {
      toast.success(`Folder "${data.name}" created successfully`);
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to create folder: ${error.message}`);
      setIsCreating(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setIsCreating(true);

    try {
      const payload: { name: string; parent_id?: string } = {
        name: folderName.trim()
      };

      if (currentFolderId) {
        payload.parent_id = currentFolderId;
      }

      await createFolderMutation.mutateAsync(payload);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleClose = () => {
    setFolderName('');
    setIsCreating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderPlus className="h-5 w-5" />
            <span>Create New Folder</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              disabled={isCreating}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !folderName.trim()}>
              {isCreating ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
