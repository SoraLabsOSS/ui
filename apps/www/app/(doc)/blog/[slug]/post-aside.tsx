"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/ui/dropdown-menu";
import { Check, ChevronDown, FileText, Link2 } from "lucide-react";
import { useState } from "react";

export function BlogPostAside({
  date,
  readingMinutes,
  title,
  url,
}: {
  author?: string;
  date: Date;
  description?: string;
  readingMinutes: number | null;
  title: string;
  url: string;
}) {
  const [copiedType, setCopiedType] = useState<"url" | "markdown" | null>(null);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCopyUrl = async () => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedType("url");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      const md = `[${title}](${fullUrl})`;
      await navigator.clipboard.writeText(md);
      setCopiedType("markdown");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <aside className="relative @lg:order-last order-first @lg:col-span-3 @xl:col-span-2 col-span-12 @lg:col-start-10 @xl:col-start-11 @max-lg:-mb-3 @max-lg:mb-6 flex h-fit @lg:flex-col flex-wrap @max-lg:items-center justify-start gap-x-3 gap-y-2 @max-lg:border-b @max-lg:pb-3 text-muted-foreground text-xs md:text-sm">
      <div>{formattedDate}</div>
      <span
        aria-hidden="true"
        className="inline @lg:hidden h-4 w-px shrink-0 bg-border"
      />
      {readingMinutes === null ? null : (
        <span className="flex items-center gap-1.5">
          {readingMinutes} min read
        </span>
      )}

      {/* Mobile action buttons */}
      <div className="flex @lg:hidden w-full flex-wrap items-center gap-3 pt-1">
        <button
          className="m-0 flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap border-none bg-transparent p-0 text-muted-foreground text-xs transition-colors hover:text-foreground md:text-sm"
          onClick={handleCopyUrl}
          type="button"
        >
          {copiedType === "url" ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Link2 className="size-3" />
          )}
          <span>{copiedType === "url" ? "Copied URL" : "Copy URL"}</span>
        </button>
        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
        <button
          className="m-0 flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap border-none bg-transparent p-0 text-muted-foreground text-xs transition-colors hover:text-foreground md:text-sm"
          onClick={handleCopyMarkdown}
          type="button"
        >
          {copiedType === "markdown" ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <FileText className="size-3" />
          )}
          <span>
            {copiedType === "markdown" ? "Copied Markdown" : "Copy Markdown"}
          </span>
        </button>
      </div>

      {/* Desktop action dropdown menu */}
      <div className="@lg:block hidden pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="group m-0 flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-muted-foreground text-xs outline-none transition-colors hover:text-foreground md:text-sm"
              type="button"
            >
              <span>Copy</span>
              <ChevronDown className="size-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleCopyUrl}
            >
              {copiedType === "url" ? (
                <Check className="mr-2 size-4 text-green-500" />
              ) : (
                <Link2 className="mr-2 size-4" />
              )}
              <span>{copiedType === "url" ? "Copied URL" : "Copy URL"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleCopyMarkdown}
            >
              {copiedType === "markdown" ? (
                <Check className="mr-2 size-4 text-green-500" />
              ) : (
                <FileText className="mr-2 size-4" />
              )}
              <span>
                {copiedType === "markdown"
                  ? "Copied Markdown"
                  : "Copy Markdown"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
