'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface BreadcrumbNavProps {
  currentFolderId?: string;
  onNavigate: (folderId?: string) => void;
}

export function BreadcrumbNav({ currentFolderId, onNavigate }: BreadcrumbNavProps) {
  // For now, we'll keep it simple since we don't have folder path resolution
  // In a full implementation, you'd want to fetch the folder hierarchy

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(undefined)}
        className={`h-auto p-1 ${!currentFolderId ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Home className="mr-1 h-4 w-4" />
        My Drive
      </Button>
      {currentFolderId && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">Current Folder</span>
        </>
      )}
    </nav>
  );
}
