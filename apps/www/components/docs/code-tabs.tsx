"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/docs/copy-button";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  type TabsProps,
  TabsTrigger,
} from "@/registry/primitives/animate/tabs";

const PACKAGE_MANAGER_STORAGE_KEY = "sora-ui-package-manager";
const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

let cachedPackageManager: string | null = null;

function getSavedPackageManager(): string | null {
  if (cachedPackageManager) {
    return cachedPackageManager;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY);
      if (stored) {
        cachedPackageManager = stored;
        return stored;
      }
    } catch {
      // Ignore localStorage access errors (e.g. private browsing)
    }
  }
  return null;
}

const isPackageManager = (value: string): value is PackageManager =>
  PACKAGE_MANAGERS.includes(value as PackageManager);

const cliHighlightCache = new Map<string, string>();

function highlightBashCommandSync(code: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<pre class="font-mono text-[13px] leading-relaxed tracking-tight text-foreground" tabindex="0"><code><span class="line">${escaped}</span></code></pre>`;
}

function buildFallbackHtml(code: string): string {
  return highlightBashCommandSync(code);
}

function getInitialHighlightedCodes(
  codes: Record<string, string>,
  lang: string,
  theme: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [command, val] of Object.entries(codes)) {
    const key = `${lang}:${theme}:${val}`;
    result[command] = cliHighlightCache.get(key) ?? buildFallbackHtml(val);
  }
  return result;
}

type CodeTabsProps = {
  codes: Record<string, string>;
  lang?: string;
  themes?: { light: string; dark: string };
  copyButton?: boolean;
  onCopiedChange?: (copied: boolean, content?: string) => void;
} & Omit<TabsProps, "children">;

function CodeTabs({
  codes,
  lang = "bash",
  themes = {
    light: "github-light",
    dark: "github-dark",
  },
  className,
  defaultValue,
  value,
  onValueChange,
  copyButton = true,
  onCopiedChange,
  ...props
}: CodeTabsProps) {
  const { resolvedTheme } = useTheme();

  const [highlightedCodes, setHighlightedCodes] = useState<
    Record<string, string>
  >(() => getInitialHighlightedCodes(codes, lang, resolvedTheme ?? "dark"));
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return Object.keys(codes)[0] ?? "";
  });

  useEffect(() => {
    if (value !== undefined) {
      return;
    }

    const saved = getSavedPackageManager();
    if (saved && saved in codes) {
      setSelectedCode((prev) => (prev === saved ? prev : saved));
    }
  }, [codes, value]);

  useEffect(() => {
    if (value !== undefined) {
      return;
    }

    const handlePackageManagerChange = (event: Event) => {
      const nextValue =
        event instanceof StorageEvent
          ? event.newValue
          : (event as CustomEvent<string>).detail;

      if (nextValue && nextValue in codes) {
        cachedPackageManager = nextValue;
        setSelectedCode((prev) => (prev === nextValue ? prev : nextValue));
      }
    };

    window.addEventListener("storage", handlePackageManagerChange);
    window.addEventListener(
      "sora-ui-package-manager-change",
      handlePackageManagerChange
    );

    return () => {
      window.removeEventListener("storage", handlePackageManagerChange);
      window.removeEventListener(
        "sora-ui-package-manager-change",
        handlePackageManagerChange
      );
    };
  }, [codes, value]);

  const codesKey = Object.entries(codes)
    .map(([k, v]) => `${k}:${v}`)
    .join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: codesKey tracks code content changes stably
  useEffect(() => {
    let cancelled = false;

    async function loadHighlightedCode() {
      const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
      const missing: [string, string][] = [];
      const updated: Record<string, string> = {};

      for (const [command, val] of Object.entries(codes)) {
        const cacheKey = `${lang}:${currentTheme}:${val}`;
        const cached = cliHighlightCache.get(cacheKey);
        if (cached) {
          updated[command] = cached;
        } else {
          missing.push([command, val]);
        }
      }

      if (missing.length === 0) {
        setHighlightedCodes((prev) => {
          const keys = Object.keys(updated);
          if (
            prev &&
            keys.length === Object.keys(prev).length &&
            keys.every((k) => prev[k] === updated[k])
          ) {
            return prev;
          }
          return updated;
        });
        return;
      }

      try {
        const { codeToHtml } = await import("shiki");
        if (cancelled) {
          return;
        }

        await Promise.all(
          missing.map(async ([command, val]) => {
            const cacheKey = `${lang}:${currentTheme}:${val}`;
            const highlighted = await codeToHtml(val, {
              lang,
              themes: {
                light: themes.light,
                dark: themes.dark,
              },
              defaultColor: currentTheme,
            });
            cliHighlightCache.set(cacheKey, highlighted);
            updated[command] = highlighted;
          })
        );

        if (!cancelled) {
          setHighlightedCodes((prev) => {
            const keys = Object.keys(updated);
            if (
              prev &&
              keys.length === Object.keys(prev).length &&
              keys.every((k) => prev[k] === updated[k])
            ) {
              return prev;
            }
            return updated;
          });
        }
      } catch (error) {
        console.error("Error highlighting codes", error);
      }
    }

    loadHighlightedCode();

    return () => {
      cancelled = true;
    };
  }, [resolvedTheme, lang, themes.light, themes.dark, codesKey]);

  return (
    <Tabs
      className={cn(
        "w-full gap-0 overflow-hidden rounded-xl border border-border/60",
        className
      )}
      data-slot="install-tabs"
      {...props}
      onValueChange={(val) => {
        setSelectedCode(val);
        if (isPackageManager(val)) {
          cachedPackageManager = val;
          try {
            window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, val);
            window.dispatchEvent(
              new CustomEvent("sora-ui-package-manager-change", {
                detail: val,
              })
            );
          } catch (error) {
            console.error("Error saving package manager preference", error);
          }
        }
        onValueChange?.(val);
      }}
      value={selectedCode}
    >
      <div className="flex h-10 items-center justify-between border-border/50 border-b px-3">
        <TabsList className="flex items-center gap-0.5">
          <TabsHighlight
            className="h-full rounded-md bg-muted"
            containerClassName="flex items-center gap-0.5"
            mode="parent"
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {Object.keys(codes).map((code) => (
              <TabsHighlightItem key={code} value={code}>
                <TabsTrigger
                  className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                  value={code}
                >
                  {code}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </TabsHighlight>
        </TabsList>

        {copyButton && highlightedCodes && (
          <CopyButton
            className="-me-1 bg-transparent hover:bg-foreground/5 dark:hover:bg-foreground/10"
            content={codes[selectedCode]}
            onCopiedChange={onCopiedChange}
            size="icon-sm"
            variant="ghost"
          />
        )}
      </div>

      <div className="p-1.5">
        <TabsContents
          className="rounded-lg bg-surface"
          data-slot="install-tabs-contents"
        >
          {Object.entries(codes).map(([code, val]) => (
            <TabsContent
              className="w-full"
              data-slot="install-tabs-content"
              key={code}
              value={code}
            >
              <div className="w-full overflow-x-auto p-4 text-sm">
                <div
                  className="not-fumadocs-codeblock [&>pre,_&_code]:!bg-transparent [&_code]:!text-[13px] [&_.line]:!px-0 flex w-full items-start [&>pre,_&_code]:border-none [&>pre,_&_code]:[background:transparent_!important]"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: highlighted code HTML
                  dangerouslySetInnerHTML={{
                    __html: highlightedCodes[code] ?? buildFallbackHtml(val),
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </TabsContents>
      </div>
    </Tabs>
  );
}

export { CodeTabs, type CodeTabsProps };
