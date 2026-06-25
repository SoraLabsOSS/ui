"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronLeft, Copy, FileCode2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { catalogSourcePanelGutterClassName } from "./catalog-preview-classes";

interface ComponentPageSourcePanelProps {
  filename?: string;
  onClose: () => void;
  open: boolean;
  registryName: string;
}

interface SourcePanelContentProps {
  isLoading: boolean;
  loadError: string | null;
  sourceHtml: string | null;
}

function SourcePanelContent({
  isLoading,
  loadError,
  sourceHtml,
}: SourcePanelContentProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-4 pt-24 pb-24">
        <span className="font-mono text-muted-foreground/60 text-sm tracking-wide">
          Loading source code...
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-4 pt-24 pb-24 text-muted-foreground text-sm">
        {loadError}
      </div>
    );
  }

  if (!sourceHtml) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full border-none bg-transparent text-sm",
        "[&_.relative.group_>_button]:hidden",
        "[&_.shiki]:rounded-none [&_.shiki]:border-none"
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: server-highlighted shiki HTML
      dangerouslySetInnerHTML={{ __html: sourceHtml }}
      data-code-block
      data-line-numbers="false"
    />
  );
}

function useComponentSource(
  open: boolean,
  registryName: string,
  initialFilename?: string
) {
  const [sourceCode, setSourceCode] = useState("");
  const [sourceHtml, setSourceHtml] = useState<string | null>(null);
  const [sourceFilename, setSourceFilename] = useState(initialFilename);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadedRegistryRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRegistryRef.current === registryName) {
      return;
    }

    setSourceCode("");
    setSourceHtml(null);
    setLoadError(null);
    setSourceFilename(initialFilename);
    loadedRegistryRef.current = null;
  }, [initialFilename, registryName]);

  useEffect(() => {
    if (!(open && registryName)) {
      return;
    }

    if (loadedRegistryRef.current === registryName && sourceHtml) {
      return;
    }

    let cancelled = false;

    const applySourceResponse = (data: {
      code?: string;
      html?: string;
      filename?: string;
    }) => {
      setSourceCode(data.code ?? "");
      setSourceHtml(data.html ?? "");
      if (data.filename) {
        setSourceFilename(data.filename);
      }
      loadedRegistryRef.current = registryName;
    };

    const fetchSource = async () => {
      setIsLoading(true);
      setLoadError(null);

      const response = await fetch("/api/catalog/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component: registryName }),
      });

      if (!response.ok) {
        throw new Error("Failed to load source code");
      }

      const data = (await response.json()) as {
        code?: string;
        html?: string;
        filename?: string;
      };

      if (cancelled) {
        return;
      }

      applySourceResponse(data);
    };

    fetchSource()
      .catch(() => {
        if (!cancelled) {
          setLoadError("Unable to load source code right now.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, registryName, sourceHtml]);

  return {
    isLoading,
    loadError,
    sourceCode,
    sourceFilename,
    sourceHtml,
  };
}

export function ComponentPageSourcePanel({
  open,
  onClose,
  registryName,
  filename: initialFilename,
}: ComponentPageSourcePanelProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const sourceDragControls = useDragControls();
  const { isLoading, loadError, sourceCode, sourceFilename, sourceHtml } =
    useComponentSource(open, registryName, initialFilename);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const handleCopy = () => {
    if (!sourceCode) {
      return;
    }

    navigator.clipboard.writeText(sourceCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ y: 0 }}
          className={cn(
            "pointer-events-none fixed left-0 z-70 flex w-full flex-col outline-none",
            "top-(--fd-banner-height) h-[calc(100dvh-var(--fd-banner-height))]",
            "max-lg:top-auto max-lg:bottom-0 max-lg:h-[80vh] max-lg:rounded-t-lg max-lg:border-border/20 max-lg:border-t",
            "lg:w-1/2",
            catalogSourcePanelGutterClassName
          )}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragControls={sourceDragControls}
          dragElastic={{ top: 0, bottom: 0.4 }}
          dragListener={false}
          exit={{ y: "100%" }}
          initial={{ y: "100%" }}
          onDragEnd={(_event, info: PanInfo) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              onClose();
            }
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="pointer-events-auto relative h-full overflow-hidden rounded-2xl border border-border/50 bg-secondary">
            <div className="pointer-events-none absolute top-0 right-0 left-0 z-20">
              <div className="mask-[linear-gradient(to_bottom,black_20%,transparent)] absolute inset-0 h-32 bg-linear-to-b from-secondary to-transparent" />
              <div className="pointer-events-auto relative z-10 flex flex-col">
                <div
                  className="flex touch-none items-center justify-center pt-2 pb-1"
                  onPointerDown={(event) => sourceDragControls.start(event)}
                >
                  <div className="h-1 w-10 rounded-full bg-foreground/10 transition-colors hover:bg-foreground/20" />
                </div>

                <div className="flex items-center justify-between px-4 py-1">
                  <button
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                    onClick={onClose}
                    type="button"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="font-mono text-xs tracking-wide">
                      Source Code
                    </span>
                  </button>

                  <div className="flex items-center gap-3">
                    {sourceFilename ? (
                      <div className="flex items-center gap-1.5">
                        <FileCode2
                          aria-hidden
                          className="size-3.5 text-muted-foreground"
                        />
                        <span className="font-mono text-muted-foreground text-xs">
                          {sourceFilename}
                        </span>
                      </div>
                    ) : null}
                    {sourceCode ? (
                      <button
                        aria-label={copied ? "Copied" : "Copy code"}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onClick={handleCopy}
                        type="button"
                      >
                        {copied ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full min-h-0">
              <div className="mask-[linear-gradient(to_top,black_30%,transparent)] pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-16 bg-linear-to-t from-secondary to-transparent" />
              <div
                className={cn(
                  "h-full overflow-auto",
                  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  "[&_.relative.group_>_button]:hidden",
                  "[&_pre]:min-h-full [&_pre]:px-4! [&_pre]:pt-24! [&_pre]:pb-24!"
                )}
                data-drawer-code
              >
                <SourcePanelContent
                  isLoading={isLoading}
                  loadError={loadError}
                  sourceHtml={sourceHtml}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
