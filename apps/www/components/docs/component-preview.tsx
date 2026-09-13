"use client";

import ReactIcon from "@workspace/ui/components/icons/react-icon";
import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { Fullscreen, Loader } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { index } from "@/__registry__";
import { ComponentWrapper } from "@/components/docs/component-wrapper";
import { DynamicCodeBlock } from "@/components/docs/dynamic-codeblock";
import { RefreshButton } from "@/components/docs/refresh";
import { type Binds, Tweakpane } from "@/components/docs/tweakpane";
import {
  extractPropsForCodegen,
  generateUsageExampleCode,
  installImportPathFromTarget,
} from "@/lib/docs/generate-usage-example-code";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@/registry/primitives/animate/tabs";

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  bigScreen?: boolean;
  /** Registry demo item for the Code tab (defaults to `demo-{name}` when present). */
  demo?: string;
  /** Short description rendered below the preview frame. */
  description?: string;
  iframe?: boolean;
  name: string;
}

const UI_FRAMEWORK_PREFIX = /^(base|radix)-/;

type RegistryIndexEntry = (typeof index)[string];

function isCanonicalDemoForItem(demoName: string, depName: string): boolean {
  const strippedDep = depName.replace(UI_FRAMEWORK_PREFIX, "");
  return (
    demoName === depName ||
    demoName === `demo-${depName}` ||
    demoName === `demo-${strippedDep}`
  );
}

function resolveDemoProps(name: string): Record<string, unknown> {
  const entry = index[name] as RegistryIndexEntry | undefined;
  const direct = entry?.component?.demoProps;
  if (direct && Object.keys(direct).length > 0) {
    return direct;
  }

  const demoEntry = index[`demo-${name}`] as RegistryIndexEntry | undefined;
  const fromDemo = demoEntry?.component?.demoProps;
  if (fromDemo && Object.keys(fromDemo).length > 0) {
    return fromDemo;
  }

  for (const dep of entry?.registryDependencies ?? []) {
    if (isCanonicalDemoForItem(name, dep)) {
      const inherited = (index[dep] as RegistryIndexEntry | undefined)
        ?.component?.demoProps;
      if (inherited && Object.keys(inherited).length > 0) {
        return inherited;
      }
    }
  }

  return {};
}

/** Usage example source for the Code tab; preview still uses `name`. */
function resolveUsageCodeEntry(
  previewName: string,
  explicitDemo?: string
): RegistryIndexEntry | undefined {
  if (explicitDemo) {
    const entry = index[explicitDemo] as RegistryIndexEntry | undefined;
    if (entry?.files?.[0]?.content) {
      return entry;
    }
  }

  const autoDemoName = `demo-${previewName}`;
  const autoEntry = index[autoDemoName] as RegistryIndexEntry | undefined;
  if (autoEntry?.files?.[0]?.content) {
    return autoEntry;
  }

  return index[previewName] as RegistryIndexEntry | undefined;
}

/** Physical demo folder on disk — not the synthetic code-only `demo-*` entry. */
function isManualUsageDemo(entry: RegistryIndexEntry | undefined): boolean {
  return Boolean(entry?.component && entry.files?.[0]?.content);
}

function flattenFirstLevel<T>(input: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const current of Object.values(input)) {
    if (typeof current === "object" && current !== null) {
      Object.assign(result, current);
    }
  }
  return result as T;
}

function unwrapValues(obj: Record<string, unknown>): Record<string, unknown> {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    if ("value" in obj) {
      return obj.value as Record<string, unknown>;
    }
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        result[key] = unwrapValues(obj[key] as Record<string, unknown>);
      }
    }
    return result;
  }
  return obj;
}

export function ComponentPreview({
  name,
  demo,
  description,
  className,
  iframe = false,
  bigScreen = false,
  ...props
}: ComponentPreviewProps) {
  const [binds, setBinds] = useState<Binds | null>(null);
  const [componentProps, setComponentProps] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const previousPropsSnapshot = useRef<string | null>(null);

  const demoPropsConfig = useMemo(() => resolveDemoProps(name), [name]);

  const usageCodeMeta = useMemo(() => {
    const entry = resolveUsageCodeEntry(name, demo);
    const file = entry?.files?.[0];

    return {
      staticContent: file?.content ?? null,
      title: file?.target?.split("/").pop() ?? `${demo ?? `demo-${name}`}.tsx`,
      installTarget: (index[name] as RegistryIndexEntry | undefined)?.files?.[0]
        ?.target,
      manualDemo: isManualUsageDemo(entry),
    };
  }, [name, demo]);

  const displayCode = useMemo(() => {
    const { installTarget, staticContent, manualDemo } = usageCodeMeta;

    if (
      !manualDemo &&
      Object.keys(demoPropsConfig).length > 0 &&
      componentProps &&
      installTarget
    ) {
      const extracted = extractPropsForCodegen(demoPropsConfig, componentProps);
      if (extracted) {
        return generateUsageExampleCode({
          componentName: extracted.componentName,
          importPath: installImportPathFromTarget(installTarget),
          props: extracted.props,
        });
      }
    }

    return staticContent;
  }, [demoPropsConfig, componentProps, usageCodeMeta]);

  const preview = useMemo(() => {
    const Component = index[name]?.component;
    if (Object.keys(demoPropsConfig).length !== 0) {
      if (componentProps === null) {
        setComponentProps(unwrapValues(demoPropsConfig));
      }
      if (binds === null) {
        setBinds(demoPropsConfig as Binds);
      }
    }

    if (!Component) {
      console.error(`Component with name "${name}" not found in registry.`);
      return (
        <p className="text-muted-foreground text-sm">
          Component{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{" "}
          not found in registry.
        </p>
      );
    }

    return <Component {...flattenFirstLevel(componentProps ?? {})} />;
  }, [name, componentProps, binds, demoPropsConfig]);

  useEffect(() => {
    if (!binds) {
      return;
    }
    setComponentProps(unwrapValues(binds));
  }, [binds]);

  useEffect(() => {
    if (componentProps === null) {
      return;
    }

    const snapshot = JSON.stringify(componentProps);

    if (previousPropsSnapshot.current === null) {
      previousPropsSnapshot.current = snapshot;
      return;
    }

    if (previousPropsSnapshot.current === snapshot) {
      return;
    }

    previousPropsSnapshot.current = snapshot;
    setPreviewKey((current) => current + 1);
  }, [componentProps]);

  return (
    <div
      className={cn("not-prose my-4 w-full lg:max-w-[120ch]", className)}
      {...props}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/50"
        id="component-preview"
      >
        <Tabs className="w-full gap-0" defaultValue="preview">
          <div
            className="flex h-11 items-center justify-between border-border/50 border-b px-3"
            id="component-preview-tab-list"
          >
            <TabsList className="flex items-center gap-0.5">
              <TabsHighlight
                className="h-full rounded-md bg-muted"
                containerClassName="flex"
                mode="parent"
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <TabsHighlightItem value="preview">
                  <TabsTrigger
                    className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                    value="preview"
                  >
                    Preview
                  </TabsTrigger>
                </TabsHighlightItem>
                {displayCode ? (
                  <TabsHighlightItem value="code">
                    <TabsTrigger
                      className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                      value="code"
                    >
                      Code
                    </TabsTrigger>
                  </TabsHighlightItem>
                ) : null}
              </TabsHighlight>
            </TabsList>
          </div>

          <TabsContents>
            <TabsContent
              animate={{ opacity: 1 }}
              className="relative h-full"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              value="preview"
            >
              <div className="relative">
                {/* top actions */}
                <div className="absolute top-0 right-6 z-10 flex h-12 items-center justify-end gap-1.5 px-2">
                  <RefreshButton
                    onRefresh={() => setPreviewKey((prev) => prev + 1)}
                  />

                  {iframe ? (
                    <Button
                      asChild
                      className="flex items-center rounded-lg"
                      size="icon-sm"
                      variant="neutral"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Fullscreen aria-label="fullscreen-btn" size={14} />
                      </motion.button>
                    </Button>
                  ) : null}
                </div>

                {/* top dashed */}
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute top-12 left-0 h-px w-full"
                >
                  <line
                    className="text-border"
                    stroke="currentColor"
                    strokeDasharray="8 4"
                    strokeWidth="1"
                    x1="0"
                    x2="100%"
                    y1="0"
                    y2="0"
                  />
                </svg>
                {/* left dashed */}
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-6 h-full w-px"
                >
                  <line
                    className="text-border"
                    stroke="currentColor"
                    strokeDasharray="8 4"
                    strokeWidth="1"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="100%"
                  />
                </svg>
                {/* right dashed */}
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 right-6 h-full w-px"
                >
                  <line
                    className="text-border"
                    stroke="currentColor"
                    strokeDasharray="8 4"
                    strokeWidth="1"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="100%"
                  />
                </svg>

                {/* preview area */}
                <div className="px-6 pt-12 pb-6">
                  <ComponentWrapper
                    bigScreen={bigScreen}
                    iframe={iframe}
                    key={previewKey}
                    name={name}
                  >
                    <Suspense
                      fallback={
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Loader className="mr-2 size-4 animate-spin" />
                          Loading...
                        </div>
                      }
                    >
                      {preview}
                    </Suspense>
                  </ComponentWrapper>
                </div>

                {/* tweakpane & separator — only shown when props exist */}
                <AnimatePresence>
                  {binds ? (
                    <>
                      {/* bottom dashed separator */}
                      <svg aria-hidden="true" className="block h-px w-full">
                        <line
                          className="text-border"
                          stroke="currentColor"
                          strokeDasharray="8 4"
                          strokeWidth="1"
                          x1="0"
                          x2="100%"
                          y1="0"
                          y2="0"
                        />
                      </svg>
                      <motion.div
                        animate={{ opacity: 1, height: "auto" }}
                        className="overflow-hidden"
                        exit={{ opacity: 0, height: 0 }}
                        initial={{ opacity: 0, height: 0 }}
                        key="tweakpane"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                      >
                        <div className="w-full px-4.5 py-4">
                          <Tweakpane binds={binds} onBindsChange={setBinds} />
                        </div>
                      </motion.div>
                    </>
                  ) : null}
                </AnimatePresence>
              </div>
            </TabsContent>

            {displayCode ? (
              <TabsContent
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                value="code"
              >
                <div className="relative w-full overflow-hidden [&_.fd-codeblock]:my-0 [&_.fd-codeblock]:rounded-none [&_.fd-codeblock]:border-0 [&_[data-slot=codeblock-viewport]]:max-h-[500px]">
                  <DynamicCodeBlock
                    code={displayCode}
                    icon={<ReactIcon />}
                    lang="tsx"
                    title={usageCodeMeta.title}
                  />
                </div>
              </TabsContent>
            ) : null}
          </TabsContents>
        </Tabs>
      </div>

      {description ? (
        <div className="flex items-center justify-center pt-3 text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
