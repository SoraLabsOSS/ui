"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

export function BlogPostAside({
  date,
  readingMinutes,
  url,
}: {
  author?: string;
  date: Date;
  description?: string;
  readingMinutes: number | null;
  title?: string;
  url: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCopyUrl = async () => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <aside className="relative order-first col-span-12 flex h-fit w-full flex-wrap justify-start gap-x-3 gap-y-2 text-muted-foreground text-xs max-xl:mx-auto max-xl:-mb-3 max-xl:mb-6 max-xl:max-w-3xl max-xl:items-center max-xl:border-b max-xl:pb-3 md:text-sm xl:order-last xl:col-span-2 xl:col-start-11 xl:flex-col">
      <div>{formattedDate}</div>
      <span
        aria-hidden="true"
        className="inline h-4 w-px shrink-0 bg-border xl:hidden"
      />
      {readingMinutes === null ? null : (
        <span className="flex items-center gap-1.5">
          {readingMinutes} min read
        </span>
      )}

      {/* Copy URL action button */}
      <div className="flex items-center pt-1">
        <button
          className="m-0 flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap border-none bg-transparent p-0 text-muted-foreground text-xs transition-colors hover:text-foreground md:text-sm"
          onClick={handleCopyUrl}
          type="button"
        >
          {isCopied ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Link2 className="size-3" />
          )}
          <span>{isCopied ? "Copied URL" : "Copy URL"}</span>
        </button>
      </div>
    </aside>
  );
}
