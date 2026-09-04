"use client";

import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { type JSX, useEffect, useState } from "react";
import { BlogShareButton } from "./share-button";

const layoutTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.3,
} as const;

export function BlogPostActions({ url }: { url: string }): JSX.Element {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const activeTransition = isReady ? layoutTransition : { duration: 0 };

  return (
    <LayoutGroup id={`blog-post-actions-${url}`}>
      <motion.div
        className="flex w-full max-w-full flex-row flex-wrap items-center gap-2"
        layout
        transition={activeTransition}
      >
        <motion.div
          className="shrink-0"
          layout="position"
          transition={activeTransition}
        >
          <BlogShareButton transition={activeTransition} url={url} />
        </motion.div>
        <motion.div
          className="shrink-0"
          layout="position"
          transition={activeTransition}
        >
          <Link
            className={cn(
              buttonVariants({
                color: "secondary",
                size: "sm",
                className:
                  "gap-1.5 border-0 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
              })
            )}
            href="/blog"
          >
            <ArrowLeft aria-hidden />
            Blog
          </Link>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
