"use client";

import { cn } from "@workspace/ui/lib/utils";
import { TypeTable } from "fumadocs-ui/components/type-table";
import type { ReactNode } from "react";

interface CatalogTypeTableProps {
  type: Record<
    string,
    {
      default?: string;
      deprecated?: boolean;
      description?: ReactNode;
      required?: boolean;
      type: string;
      typeDescription?: ReactNode;
      typeDescriptionLink?: string;
    }
  >;
}

export function CatalogTypeTable({ type }: CatalogTypeTableProps) {
  return (
    <div
      className={cn(
        "catalog-type-table my-4 w-full min-w-0 max-w-full",
        "[&>div]:min-w-0 [&>div]:max-w-full"
      )}
    >
      <TypeTable type={type} />
    </div>
  );
}
