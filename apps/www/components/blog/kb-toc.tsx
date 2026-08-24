"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/ui/popover";
import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePublishHeaderToc } from "@/components/docs/docs-toc-header-slot";

export interface TocItem {
  href: string;
  level: number;
  name: string;
  normalizedPosition: number;
}

const HASH_PREFIX_REGEX = /^#\s*/;
const COPY_HEADING_PREFIX_REGEX = /^Copy link to heading\s*/i;

function getBarWidth(level: number): number {
  if (level === 2) {
    return 20;
  }
  if (level === 3) {
    return 14;
  }
  return 10;
}

function extractHeadingText(heading: HTMLElement): string {
  const clone = heading.cloneNode(true) as HTMLElement;

  const iconsAndAnchors = clone.querySelectorAll(
    'a.subheading-anchor, a[aria-label*="anchor" i], a[aria-label*="heading" i], svg, [aria-hidden="true"]'
  );
  for (const el of iconsAndAnchors) {
    const txt = el.textContent?.trim();
    if (
      txt === "#" ||
      txt === "" ||
      el.tagName === "svg" ||
      el.getAttribute("aria-hidden") === "true"
    ) {
      el.remove();
    }
  }

  let text = clone.textContent?.trim() || "";
  text = text
    .replace(HASH_PREFIX_REGEX, "")
    .replace(COPY_HEADING_PREFIX_REGEX, "")
    .trim();

  return text || heading.textContent?.trim() || "";
}

function findActiveBlogHeadingId(ids: string[]): string | undefined {
  if (ids.length === 0 || typeof document === "undefined") {
    return;
  }

  const scrollElement = document.scrollingElement || document.documentElement;
  const scrollTop = scrollElement.scrollTop || window.scrollY || 0;
  const viewportHeight = window.innerHeight || scrollElement.clientHeight || 0;
  const scrollHeight =
    scrollElement.scrollHeight || document.body.scrollHeight || 0;

  if (scrollTop <= 10) {
    return ids[0];
  }

  const isScrollable = scrollHeight > viewportHeight + 100;
  if (
    isScrollable &&
    scrollTop > 50 &&
    scrollTop + viewportHeight >= scrollHeight - 80
  ) {
    return ids.at(-1);
  }

  const threshold = 140;
  let currentId = ids[0];
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= threshold) {
        currentId = id;
      } else {
        break;
      }
    }
  }

  return currentId;
}

function scrollActiveBlogItem(
  scroller: HTMLElement,
  id: string,
  behavior: ScrollBehavior
): boolean {
  const target = scroller.querySelector<HTMLElement>(
    `a[href="#${CSS.escape(id)}"]`
  );
  if (!target) {
    return false;
  }

  if (scroller.clientHeight === 0) {
    return false;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (scrollerRect.height === 0 || targetRect.height === 0) {
    return false;
  }

  const maxScrollTop = scroller.scrollHeight - scroller.clientHeight;
  if (maxScrollTop <= 0) {
    return true;
  }

  const targetCenter = targetRect.top + targetRect.height / 2;
  const scrollerCenter = scrollerRect.top + scrollerRect.height / 2;
  const nextScrollTop = Math.max(
    0,
    Math.min(maxScrollTop, scroller.scrollTop + (targetCenter - scrollerCenter))
  );
  scroller.scrollTo({ top: nextScrollTop, behavior });
  return true;
}

export function KbToc({
  contentId = "kb-main-content",
  className,
}: {
  contentId?: string;
  className?: string;
}) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isPastBottom, setIsPastBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const prefersReducedMotion = useReducedMotion();
  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  prefersReducedMotionRef.current = prefersReducedMotion;
  const headerItems = useMemo(
    () =>
      items.map((item) => ({
        depth: item.level,
        title: item.name,
        url: item.href,
      })),
    [items]
  );
  usePublishHeaderToc(headerItems, true);

  // Auto-scroll active item into view ONCE when popover opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let frameId: number;
    let attempts = 0;
    const maxAttempts = 15;

    const tryScroll = () => {
      attempts += 1;
      const scroller = contentRef.current;
      const id = activeIdRef.current;
      const behavior: ScrollBehavior = prefersReducedMotionRef.current
        ? "auto"
        : "smooth";
      const done =
        scroller && id ? scrollActiveBlogItem(scroller, id, behavior) : false;

      if (!done && attempts < maxAttempts) {
        frameId = requestAnimationFrame(tryScroll);
      }
    };

    frameId = requestAnimationFrame(tryScroll);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen]);

  // Extract headings from the content DOM
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById(contentId);
      if (!el) {
        return;
      }

      const headings = el.querySelectorAll<HTMLElement>("h2, h3, h4");
      const scrollHeight = el.scrollHeight;

      const parsedItems: TocItem[] = Array.from(headings)
        .map((heading) => {
          const level = Number.parseInt(heading.tagName.slice(1), 10);
          let id = heading.id;
          if (!id) {
            const childWithId = heading.querySelector("[id]");
            if (childWithId) {
              id = childWithId.id;
            }
          }

          const text = extractHeadingText(heading);

          if (!id) {
            id = text.toLowerCase().replace(/[?()]/g, "").replace(/\s+/g, "-");
            heading.id = id;
          }

          const rect = heading.getBoundingClientRect();
          const scrollY = window.scrollY;
          const normalizedPos = Math.max(
            0,
            Math.min(1, (rect.top + scrollY - el.offsetTop) / scrollHeight)
          );

          return {
            name: text,
            href: `#${id}`,
            level,
            normalizedPosition: normalizedPos,
          };
        })
        .filter((item) => item.name.length > 0);

      setItems(parsedItems);
    }, 150);

    return () => clearTimeout(timer);
  }, [contentId]);

  // Track active heading with IntersectionObserver and scroll position fallback
  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const ids = items.map((item) => item.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    const updateActiveHeading = () => {
      const currentId = findActiveBlogHeadingId(ids);
      if (currentId) {
        setActiveId(currentId);
      }
    };

    updateActiveHeading();
    const frame = requestAnimationFrame(updateActiveHeading);
    const timer = setTimeout(updateActiveHeading, 100);

    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
      observer.disconnect();
    };
  }, [items]);

  // Scroll listener to hide TOC indicator when scrolled past article bottom
  useEffect(() => {
    const el = document.getElementById(contentId);
    if (!el) {
      return;
    }

    const handleScroll = () => {
      setIsPastBottom(el.getBoundingClientRect().bottom < 600);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [contentId]);

  // Hover handlers with debounce
  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (isPastBottom) {
      setIsOpen(false);
    }
  }, [isPastBottom]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Minimap TOC on Right */}
      <Popover onOpenChange={setIsOpen} open={isOpen && !isPastBottom}>
        <PopoverTrigger asChild>
          <div
            aria-hidden={isPastBottom}
            className={cn(
              "group fixed top-1/2 right-4 z-40 @xl:flex hidden -translate-y-1/2 cursor-pointer items-center transition-all duration-250 ease-in-out",
              isPastBottom && "pointer-events-none opacity-0",
              className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex flex-col items-end gap-1.5 p-2">
              {items.map((item) => {
                const isActive = activeId === item.href.slice(1);
                const barWidth = getBarWidth(item.level);

                return (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-200",
                      isActive
                        ? "w-[20px] bg-foreground"
                        : "bg-muted-foreground/40 group-hover:bg-muted-foreground/70"
                    )}
                    key={item.href}
                    style={{
                      width: isActive ? Math.max(barWidth, 16) : barWidth,
                    }}
                  />
                );
              })}
            </div>
            <div aria-hidden="true" className="h-full w-2" />
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          className={cn(
            "z-50 max-h-[60vh] w-[280px] overflow-y-auto rounded-lg border border-border bg-popover p-0 shadow-lg",
            "outline-none"
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          ref={contentRef}
          side="left"
          sideOffset={8}
        >
          <p className="px-4 pt-4 font-semibold text-foreground text-xs uppercase tracking-wider">
            On this page
          </p>
          <ul className="m-0 mt-2 list-none space-y-1 px-4 pb-4">
            {items.map((item) => {
              const isActive = activeId === item.href.slice(1);
              return (
                <li
                  className={cn({
                    "pl-0": item.level === 2,
                    "pl-3": item.level === 3,
                    "pl-6": item.level === 4,
                  })}
                  key={item.href}
                >
                  <Link
                    className={cn(
                      "block truncate py-1 text-sm no-underline transition-colors duration-150",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </>
  );
}
