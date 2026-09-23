"use client";

import { Button } from "@workspace/ui/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/ui/empty";
import Link from "next/link";

interface BookmarkEmptyStateProps {
  cta: {
    href: string;
    label: string;
    variant?: "accent" | "inverted";
  };
  description: string;
  eyebrow: string;
  title: string;
}

export function BookmarkEmptyState({
  eyebrow,
  title,
  description,
  cta,
}: BookmarkEmptyStateProps) {
  return (
    <Empty className="min-h-[360px]">
      <EmptyHeader>
        <p className="font-mono text-[13px] text-muted-foreground uppercase tracking-widest">
          {eyebrow}
        </p>
        <EmptyTitle aria-level={3} className="text-lg" role="heading">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-base">{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          asChild
          variant={cta.variant === "inverted" ? "default" : "accent"}
        >
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function BookmarkSearchEmptyState() {
  return (
    <Empty className="min-h-[200px]">
      <EmptyHeader>
        <EmptyTitle aria-level={3} className="text-lg" role="heading">
          No results
        </EmptyTitle>
        <EmptyDescription className="text-base">
          No bookmarks match your search. Try a different keyword.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
