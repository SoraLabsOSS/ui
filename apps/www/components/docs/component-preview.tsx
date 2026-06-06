"use client";

import { type Binds, Tweakpane } from "@workspace/ui/components/docs/tweakpane";
import ReactIcon from "@workspace/ui/components/icons/react-icon";
import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { index } from "@/__registry__";
import { ComponentWrapper } from "@/components/docs/component-wrapper";
import { DynamicCodeBlock } from "@/components/docs/dynamic-codeblock";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/radix/tabs";
import {
  extractPropsForCodegen,
  generateUsageExampleCode,
  installImportPathFromTarget,
} from "@/lib/docs/generate-usage-example-code";

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  bigScreen?: boolean;
  /** Registry demo item for the Code tab (defaults to `demo-{name}` when present). */
  demo?: string;
  iframe?: boolean;
  name: string;
}

type RegistryIndexEntry = (typeof index)[string];

function resolveDemoProps(name: string): Record<string, unknown> {
  const entry = index[name] as RegistryIndexEntry | undefined;
  const direct = entry?.component?.demoProps;
  if (direct && Object.keys(direct).length > 0) {
    return direct;
  }

  for (const dep of entry?.registryDependencies ?? []) {
    const inherited = (index[dep] as RegistryIndexEntry | undefined)?.component
      ?.demoProps;
    if (inherited && Object.keys(inherited).length > 0) {
      return inherited;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenFirstLevel<T>(input: Record<string, any>): T {
  return Object.values(input).reduce(
    (acc, current) => ({ ...acc, ...current }),
    {} as T
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    if ("value" in obj) {
      return obj.value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        result[key] = unwrapValues(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

export function ComponentPreview({
  name,
  demo,
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

  const demoPropsConfig = useMemo(() => resolveDemoProps(name), [name]);

  const usageCodeMeta = useMemo(() => {
    const entry = resolveUsageCodeEntry(name, demo);
    const file = entry?.files?.[0];

    return {
      staticContent: file?.content ?? null,
      title: file?.target?.split("/").pop() ?? `${demo ?? `demo-${name}`}.tsx`,
      installTarget: (index[name] as RegistryIndexEntry | undefined)?.files?.[0]
        ?.target,
    };
  }, [name, demo]);

  const displayCode = useMemo(() => {
    const { installTarget, staticContent } = usageCodeMeta;

    if (
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

  return (
    <div
      className={cn(
        "not-prose relative my-4 flex flex-col space-y-2 lg:max-w-[120ch]",
        className
      )}
      id="component-preview"
      {...props}
    >
      <Tabs className="relative mr-auto w-full" defaultValue="preview">
        <div
          className="flex items-center justify-between pb-2"
          id="component-preview-tab-list"
        >
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContents>
          <TabsContent
            animate={{ opacity: 1 }}
            className="relative h-full rounded-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            value="preview"
          >
            <ComponentWrapper
              bigScreen={bigScreen}
              iframe={iframe}
              name={name}
              tweakpane={
                binds && <Tweakpane binds={binds} onBindsChange={setBinds} />
              }
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
          </TabsContent>
          <TabsContent
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            value="code"
          >
            <div className="flex flex-col space-y-4">
              <div className="h-[450px] w-full rounded-md [&_pre]:my-0 [&_pre]:h-[400px] [&_pre]:overflow-auto">
                <DynamicCodeBlock
                  code={displayCode ?? undefined}
                  icon={<ReactIcon />}
                  lang="tsx"
                  title={usageCodeMeta.title}
                />
              </div>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
