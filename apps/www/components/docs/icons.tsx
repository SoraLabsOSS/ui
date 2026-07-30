"use client";

import { Button } from "@workspace/ui/components/ui/button";
import { Input } from "@workspace/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/ui/select";
import { cn } from "@workspace/ui/lib/utils";
import Fuse from "fuse.js";
import { Check, Infinity as InfinityIcon, RotateCcw, X } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { index } from "@/__registry__";
import { CodeTabs } from "@/components/docs/code-tabs";
import { DynamicCodeBlock } from "@/components/docs/dynamic-codeblock";
import { SoraTypeTable } from "@/components/docs/sora-type-table";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/docs/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/docs/tooltip";
import { isRecentlyReleased } from "@/lib/docs/is-recently-released";
import { AnimateIcon, staticAnimations } from "@/registry/icons/icon";

const FILTERS = {
  all: "All",
  new: "New",
} as const;

const staticAnimationsLength = Object.keys(staticAnimations).length;

const ICON_PROPS = {
  size: {
    type: "number | string",
    default: "24",
    description: "Width and height of the icon in pixels (or any CSS length).",
  },
  color: {
    type: "string",
    default: "currentColor",
    description: "Stroke color of the icon.",
  },
  className: {
    type: "string",
    description: "Additional CSS classes to apply to the icon.",
  },
  animate: {
    type: "boolean | string",
    default: "false",
    description: "Play the animation immediately (or a named animation).",
  },
  animateOnHover: {
    type: "boolean | string",
    default: "false",
    description: "Play the animation while the icon is hovered.",
  },
  animation: {
    type: "string",
    default: "default",
    description: "Which named animation to play.",
  },
  loop: {
    type: "boolean",
    default: "false",
    description: "Repeat the animation indefinitely.",
  },
} as const;

type CheckBadgeProps = Omit<HTMLMotionProps<"button">, "children"> & {
  isActive?: boolean;
  children: React.ReactNode;
};

function CheckBadge({
  className,
  children,
  isActive,
  ...props
}: CheckBadgeProps) {
  return (
    <motion.button
      className={cn(
        "flex items-center gap-1 overflow-hidden rounded-full bg-accent px-3 py-1 font-normal text-accent-foreground text-sm transition-colors duration-200 ease-in-out hover:bg-accent/80",
        isActive && "bg-primary pl-2 text-primary-foreground hover:bg-primary",
        className
      )}
      layout
      type="button"
      {...props}
    >
      {isActive && <Check className="size-3.5 stroke-3" />}
      <motion.span layout="preserve-aspect">{children}</motion.span>
    </motion.button>
  );
}

export function Icons() {
  const [animationKey, setAnimationKey] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("cli");
  const [activeAnimation, setActiveAnimation] = useState<string>("default");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [filter, setFilter] = useState<keyof typeof FILTERS>("all");

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withOptions({ history: "replace", throttleMs: 150 })
  );
  const [activeIconWithoutPrefix, setActiveIconWithoutPrefix] = useQueryState(
    "icon",
    parseAsString.withOptions({ history: "replace", throttleMs: 150 })
  );
  const activeIcon = useMemo(
    () => (activeIconWithoutPrefix ? `icons-${activeIconWithoutPrefix}` : null),
    [activeIconWithoutPrefix]
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (activeIcon) {
      setIsPanelOpen(true);
    }
  }, [activeIcon]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: clear query only when the panel closes
  useEffect(() => {
    if (!(isPanelOpen || activeIcon)) {
      return;
    }
    if (!isPanelOpen) {
      const timeout = setTimeout(() => {
        setActiveIconWithoutPrefix(null);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isPanelOpen]);

  const icons = useMemo(
    () =>
      Object.values(index).filter(
        (item) => item.name.startsWith("icons-") && item.name !== "icons-icon"
      ),
    []
  );

  const newIconNames = useMemo(
    () =>
      icons
        .filter((item) => isRecentlyReleased(item.releaseDate))
        .map((item) => item.name),
    [icons]
  );

  const filteredIcons = useMemo(() => {
    if (filter === "all") {
      return icons;
    }
    return icons.filter((item) => newIconNames.includes(item.name));
  }, [icons, filter, newIconNames]);

  const fuse = useMemo(
    () =>
      new Fuse(icons, {
        keys: ["name", "keywords"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [icons]
  );

  const searchedIcons = useMemo(() => {
    const q = search?.trim();
    if (!q) {
      return filteredIcons;
    }
    const results = fuse.search(q).map((result) => result.item);
    if (filter === "all") {
      return results;
    }
    return results.filter((item) => newIconNames.includes(item.name));
  }, [search, fuse, filteredIcons, filter, newIconNames]);

  const searchedNewIcons = useMemo(() => {
    if (!search?.trim()) {
      return newIconNames;
    }
    return searchedIcons.filter((item) => newIconNames.includes(item.name));
  }, [search, searchedIcons, newIconNames]);

  const icon = useMemo(
    () => icons.find((item) => item.name === activeIcon),
    [activeIcon, icons]
  );
  const iconName = useMemo(
    () =>
      icon?.name
        .replace("icons-", "")
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(""),
    [icon]
  );

  const shadcnCommands = useMemo(() => {
    const command = icon?.command ?? "";
    return {
      npm: `npx shadcn@latest add ${command}`,
      pnpm: `pnpm dlx shadcn@latest add ${command}`,
      yarn: `npx shadcn@latest add ${command}`,
      bun: `bun x --bun shadcn@latest add ${command}`,
    };
  }, [icon]);

  useEffect(() => {
    setActiveAnimation("default");
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="text-black dark:text-white">
      <p className="text-muted-foreground text-sm">
        {searchedIcons.length} icons {search?.length ? "found" : "available"}{" "}
        {searchedNewIcons.length ? (
          <span>
            •{" "}
            <span className="text-foreground">{`${searchedNewIcons.length} new icons`}</span>
          </span>
        ) : (
          ""
        )}
      </p>

      <Input
        className="mt-3"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons"
        value={search ?? ""}
      />

      <div className="mt-4 flex items-center gap-2">
        {Object.keys(FILTERS).map((f) => (
          <CheckBadge
            isActive={f === filter}
            key={f}
            onClick={() => setFilter(f as keyof typeof FILTERS)}
          >
            {FILTERS[f as keyof typeof FILTERS]}
          </CheckBadge>
        ))}
      </div>

      <div>
        {searchedIcons.length ? (
          <div className="mt-6 grid grid-cols-5 xs:grid-cols-7 gap-4 sm:grid-cols-9 lg:grid-cols-11 2xl:grid-cols-14">
            <TooltipProvider>
              {searchedIcons.map((item) => {
                const totalAnimationsLength =
                  staticAnimationsLength +
                  Object.keys(item?.component?.animations ?? {}).length;
                return (
                  <Tooltip key={item.name} side="bottom" sideOffset={14}>
                    <TooltipTrigger>
                      <div>
                        <AnimateIcon animateOnHover asChild>
                          <button
                            className="group relative flex aspect-square size-full items-center justify-center rounded-lg p-3.5 ring-foreground transition-shadow duration-200 hover:ring-2"
                            data-value={item.name}
                            onClick={() =>
                              setActiveIconWithoutPrefix(
                                item.name.replace("icons-", "")
                              )
                            }
                            type="button"
                          >
                            {item?.component && (
                              <item.component className="size-full text-current" />
                            )}
                            <div
                              className={cn(
                                "absolute inset-0 -z-2 rounded-lg bg-muted transition-colors duration-200",
                                activeIcon === item.name && "bg-foreground/20"
                              )}
                            />

                            {newIconNames.includes(item.name) && (
                              <div className="absolute -top-1 -right-1 size-2.5 rounded-full border border-background bg-accent-pro" />
                            )}

                            <div className="absolute -right-2.5 -bottom-2.5 z-10 flex size-5 items-center justify-center rounded-full border bg-background font-medium text-muted-foreground transition-colors duration-200 group-hover:border-foreground group-hover:ring group-hover:ring-foreground">
                              <span className="text-[11px] leading-none">
                                {totalAnimationsLength}
                              </span>
                            </div>
                          </button>
                        </AnimateIcon>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.name.replace("icons-", "")}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex h-50 items-center justify-center">
            <p className="text-muted-foreground text-sm">No icons found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="fixed inset-y-12 right-0 z-50 w-81.25 rounded-l-2xl border-y border-l bg-background p-4 shadow-sm"
            exit={{ opacity: 0, x: "100%" }}
            initial={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 150, damping: 25 }}
          >
            <h2 className="mt-1.5 font-medium text-lg">
              {activeIcon?.replace("icons-", "")}
            </h2>
            <AnimateIcon animateOnHover asChild>
              <button
                className="absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-background transition-colors duration-200 hover:bg-muted"
                onClick={() => setIsPanelOpen(false)}
                type="button"
              >
                <X className="size-5 text-neutral-500" />
              </button>
            </AnimateIcon>

            <div className="h-[calc(100%-3.25rem)] overflow-y-auto">
              <div className="flex flex-col gap-y-4">
                <div className="space-y-4">
                  {activeIcon && (
                    <>
                      <div className="relative mx-auto flex aspect-square h-37.5 w-full items-center justify-center rounded-2xl border bg-muted/50">
                        {icon?.component && (
                          <icon.component
                            animate
                            animation={activeAnimation}
                            className="size-25 text-current"
                            key={`${activeAnimation}-${activeIcon}-${animationKey}-${isLoop}`}
                            loop={isLoop}
                          />
                        )}

                        <Button
                          className={cn(
                            "absolute top-2 left-2 z-2 size-6 bg-transparent backdrop-blur-md hover:bg-black/5 dark:hover:bg-white/10",
                            isLoop &&
                              "bg-black/10 hover:bg-black/15 dark:bg-white/15 dark:hover:bg-white/20"
                          )}
                          onClick={() => setIsLoop(!isLoop)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <InfinityIcon className="size-3.5" />
                        </Button>

                        <AnimateIcon animateOnHover asChild>
                          <Button
                            className="absolute top-2 right-2 z-2 size-6 bg-transparent backdrop-blur-md hover:bg-black/5 dark:hover:bg-white/10"
                            onClick={() => setAnimationKey((prev) => prev + 1)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <RotateCcw className="size-3.5" />
                          </Button>
                        </AnimateIcon>
                      </div>

                      <Select
                        onValueChange={(value) => setActiveAnimation(value)}
                        value={activeAnimation}
                      >
                        <SelectTrigger className="h-11! w-full rounded-lg px-1.5">
                          <SelectValue placeholder="Select an animation" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="space-y-1.5 p-0.5">
                            {Object.keys({
                              ...staticAnimations,
                              ...(icon?.component?.animations ?? {}),
                            }).map((animation) => (
                              <SelectItem
                                className="h-8! rounded-md px-0 focus:bg-muted"
                                key={animation}
                                value={animation}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="size-8 rounded-md bg-muted p-1.5">
                                    {icon?.component && (
                                      <icon.component className="size-full text-current" />
                                    )}
                                  </div>
                                  <span>{animation}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>

                <div>
                  <Tabs
                    className="gap-0"
                    onValueChange={(value) => setActiveTab(value)}
                    value={activeTab}
                  >
                    <div className="mb-3 flex w-full items-center justify-between">
                      <h3 className="mt-0 mb-0 pt-0 pb-0 font-medium text-base">
                        Installation
                      </h3>
                      <TabsList>
                        <TabsTrigger className="w-17.5" value="cli">
                          CLI
                        </TabsTrigger>
                        <TabsTrigger className="w-17.5" value="manual">
                          Manual
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContents>
                      <TabsContent value="cli">
                        <CodeTabs codes={shadcnCommands} />
                      </TabsContent>
                      <TabsContent value="manual">
                        {activeIcon && (
                          <DynamicCodeBlock
                            className="**:data-[slot='codeblock-viewport']:max-h-62.5"
                            code={icon?.files?.[0]?.content}
                            lang="tsx"
                            title={`${icon?.name.replace("icons-", "")}.tsx`}
                          />
                        )}
                      </TabsContent>
                    </TabsContents>
                  </Tabs>

                  <h3 className="mt-4 font-medium text-base">Usage</h3>
                  {activeIcon && (
                    <DynamicCodeBlock
                      code={`<${iconName} animateOnHover />
// Or use with the AnimateIcon component
<AnimateIcon animateOnHover>
  <${iconName} />
</AnimateIcon>`}
                      lang="tsx"
                    />
                  )}

                  <h3 className="mt-4 mb-2 font-medium text-base">Props</h3>
                  <SoraTypeTable type={ICON_PROPS} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
