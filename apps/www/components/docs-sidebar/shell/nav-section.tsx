'use client';

import type * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

export function DocsShellSectionTitle({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-2 px-0 py-3.5 text-sm font-medium text-foreground/40',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DocsShellSection({
  label,
  children,
  className,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label && <DocsShellSectionTitle>{label}</DocsShellSectionTitle>}
      {children}
    </div>
  );
}
