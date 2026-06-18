"use client";

import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { motion } from "motion/react";
import { BookmarkButton } from "@/components/docs/bookmark-button";
import { DocsAuthor } from "@/components/docs/docs-author";
import {
  NeighborNavButtons,
  type NeighborNavItem,
} from "@/components/docs/neighbor-nav-buttons";
import { LLMCopyButton, ViewOptions } from "@/components/docs/page-actions";
import type { ComponentPageHeaderData } from "@/lib/registry/types";
import { ComponentPageMeta } from "./component-page-meta";

interface ComponentPageHeaderProps {
  className?: string;
  data: ComponentPageHeaderData;
  githubPath: string;
  nextNav?: NeighborNavItem;
  previousNav?: NeighborNavItem;
  releaseDate?: string;
}

export function ComponentPageHeader({
  data,
  githubPath,
  nextNav,
  previousNav,
  releaseDate,
  className,
}: ComponentPageHeaderProps) {
  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-6", className)}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col gap-1.5">
        <p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
          {data.collection}
        </p>
        <div className="flex w-full flex-row items-start justify-between gap-2">
          <h1 className="min-w-0 text-3xl tracking-tighter sm:text-4xl md:text-5xl">
            {data.title}
          </h1>
          <NeighborNavButtons
            fallbackUrl={data.componentUrl}
            next={nextNav}
            previous={previousNav}
          />
        </div>
        <p className="mt-1 max-w-2xl text-base text-foreground/50 leading-relaxed md:text-lg">
          {data.description}
        </p>
        {releaseDate ? (
          <time className="text-foreground/35 text-sm" dateTime={releaseDate}>
            Released {format(new Date(releaseDate), "MMMM d, yyyy")}
          </time>
        ) : null}
      </div>

      {data.author ? (
        <DocsAuthor name={data.author.name} url={data.author.url} />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <BookmarkButton url={data.componentUrl} />
        <LLMCopyButton markdownUrl={`${data.docsUrl}.mdx`} />
        <ViewOptions
          githubUrl={`https://github.com/axyl1410/sora/blob/main/apps/www/${githubPath}`}
          markdownUrl={`${data.docsUrl}.mdx`}
        />
      </div>

      <ComponentPageMeta data={data} />
    </motion.header>
  );
}
