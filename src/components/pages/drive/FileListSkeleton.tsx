'use client';

import { Skeleton } from '~/components/ui/skeleton';
import { Card, CardContent } from '~/components/ui/card';

interface FileListSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function FileListSkeleton({ viewMode = 'grid' }: FileListSkeletonProps) {
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        {/* View Controls Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {skeletonItems.map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-6 w-6" />
                  </div>

                  <div className="flex flex-col items-center space-y-2 text-center">
                    <Skeleton className="h-8 w-8" />
                    <div className="w-full space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Controls Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center space-x-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="space-y-2">
        {skeletonItems.map((i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-6 w-6" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
