"use client";

import {
  ScrollArea,
  ScrollBar,
  ScrollViewport,
} from "@workspace/ui/components/ui/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/docs/copy";
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

const isPackageManager = (value: string): value is PackageManager =>
  PACKAGE_MANAGERS.includes(value as PackageManager);

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

  const [highlightedCodes, setHighlightedCodes] = useState<Record<
    string,
    string
  > | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>(
    value ?? defaultValue ?? Object.keys(codes)[0] ?? ""
  );

  useEffect(() => {
    if (value !== undefined) {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(
        PACKAGE_MANAGER_STORAGE_KEY
      );
      if (storedValue && storedValue in codes) {
        setSelectedCode(storedValue);
      }
    } catch (error) {
      console.error("Error reading package manager preference", error);
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
        setSelectedCode(nextValue);
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

  useEffect(() => {
    async function loadHighlightedCode() {
      try {
        const { codeToHtml } = await import("shiki");
        const newHighlightedCodes: Record<string, string> = {};

        for (const [command, val] of Object.entries(codes)) {
          const highlighted = await codeToHtml(val, {
            lang,
            themes: {
              light: themes.light,
              dark: themes.dark,
            },
            defaultColor: resolvedTheme === "dark" ? "dark" : "light",
          });

          newHighlightedCodes[command] = highlighted;
        }

        setHighlightedCodes(newHighlightedCodes);
      } catch (error) {
        console.error("Error highlighting codes", error);
        setHighlightedCodes(codes);
      }
    }
    loadHighlightedCode();
  }, [resolvedTheme, lang, themes.light, themes.dark, codes]);

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
          {highlightedCodes &&
            Object.entries(highlightedCodes).map(([code, val]) => (
              <TabsContent
                className="w-full"
                data-slot="install-tabs-content"
                key={code}
                value={code}
              >
                <ScrollArea className="max-h-[600px]">
                  <ScrollViewport className="w-full">
                    <div
                      className="[&>pre,_&_code]:!bg-transparent [&_code]:!text-[13px] [&_code_.line]:!px-0 flex w-full items-center p-4 text-sm [&>pre,_&_code]:border-none [&>pre,_&_code]:[background:transparent_!important]"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: highlighted code HTML from shiki
                      dangerouslySetInnerHTML={{ __html: val }}
                    />
                  </ScrollViewport>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </TabsContent>
            ))}
        </TabsContents>
      </div>
    </Tabs>
  );
}

export { CodeTabs, type CodeTabsProps };
