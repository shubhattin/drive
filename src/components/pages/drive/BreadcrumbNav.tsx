'use client';

import { Home } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';

interface BreadcrumbNavProps {
  breadcrumbPath: { id?: string; name: string }[];
  onNavigate: (targetIndex: number) => void;
}

export function BreadcrumbNav({ breadcrumbPath, onNavigate }: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbPath.map((item, index) => (
          <div key={index} className="contents">
            <BreadcrumbItem>
              {index === breadcrumbPath.length - 1 ? (
                <BreadcrumbPage className="flex items-center">
                  {index === 0 && <Home className="mr-1 h-4 w-4" />}
                  {item.name}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate(index)}
                    className="h-auto p-1 text-muted-foreground hover:text-foreground"
                  >
                    {index === 0 && <Home className="mr-1 h-4 w-4" />}
                    {item.name}
                  </Button>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbPath.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
