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
        "catalog-type-table my-4 w-full min-w-0 max-w-full overflow-x-auto",
        "[&_table]:table-fixed! [&_table]:whitespace-normal! [&_table]:w-full! [&_table]:max-w-full!",
        "[&_td]:whitespace-normal! [&_th]:whitespace-normal! [&_td]:break-words",
        "[&_code]:whitespace-pre-wrap [&_code]:break-all"
      )}
    >
      <TypeTable type={type} />
    </div>
  );
}
