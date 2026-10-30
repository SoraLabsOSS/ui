"use client";

import ReactIcon from "@workspace/ui/components/icons/react-icon";
import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { CodeBlock, Pre } from "@/components/docs/codeblock";
import {
  DynamicCodeBlock,
  isCodeBlockCached,
} from "@/components/docs/dynamic-codeblock";

const getDepsCommands = (dependencies?: string[]) => {
  const packageNames = dependencies?.map((dep) => dep.trim()).filter(Boolean);
  if (!packageNames?.length) {
    return;
  }

  return {
    npm: `npm install ${packageNames.join(" ")}`,
    pnpm: `pnpm add ${packageNames.join(" ")}`,
    yarn: `yarn add ${packageNames.join(" ")}`,
    bun: `bun add ${packageNames.join(" ")}`,
  };
};

const getRegistryDepsCommands = (dependencies?: string[]) => {
  const quotedDependencies = dependencies
    ?.map((dep) => dep.trim())
    .filter(Boolean)
    .map((dep) => {
      if (dep.startsWith("https://ui.soralabs.studio/r/")) {
        return dep.replace("https://ui.soralabs.studio/r/", "@soralabs/");
      }
      if (dep.startsWith("https://ui.soralabs.io.vn/r/")) {
        return dep.replace("https://ui.soralabs.io.vn/r/", "@soralabs/");
      }
      if (dep.startsWith("https://")) {
        return `"${dep}"`;
      }
      return dep;
    })
    .join(" ");

  if (!quotedDependencies) {
    return;
  }

  return {
    npm: `npx shadcn@latest add ${quotedDependencies}`,
    pnpm: `pnpm dlx shadcn@latest add ${quotedDependencies}`,
    yarn: `yarn dlx shadcn@latest add ${quotedDependencies}`,
    bun: `bun x --bun shadcn@latest add ${quotedDependencies}`,
  };
};

export interface ComponentManualInstallationProps {
  afterSteps?: ReactNode;
  beforeSteps?: ReactNode;
  children?: ReactNode;
  code?: string;
  dependencies?: string[];
  devDependencies?: string[];
  html?: string;
  isActive?: boolean;
  path?: string;
  registryDependencies?: string[];
  shouldRenderCode?: boolean;
}

interface ManualCodeViewerProps {
  code?: string;
  html?: string;
  isActive?: boolean;
  path?: string;
  shouldRenderCode?: boolean;
}

const getExpandButtonContent = (isReady: boolean, isOpen: boolean) => {
  if (!isReady) {
    return "Loading...";
  }
  return isOpen ? "Collapse" : "Expand";
};

function getCollapsedHtml(fullHtml: string, maxLines = 10): string {
  const parts = fullHtml.split('<span class="line">');
  if (parts.length <= maxLines) {
    return fullHtml;
  }
  return `${parts.slice(0, maxLines).join('<span class="line">')}</code></pre>`;
}

const ManualCodeViewer = ({
  code,
  html,
  isActive = true,
  path,
  shouldRenderCode = true,
}: ManualCodeViewerProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isDynamicReady, setIsDynamicReady] = useState(() =>
    Boolean(code && isCodeBlockCached("tsx", code))
  );
  const prefersReducedMotion = useReducedMotion();
  const prevCodeRef = useRef(code);

  const isCodeReady = Boolean(html) || isDynamicReady;

  const collapsedHtml = useMemo(() => {
    if (!html) {
      return;
    }
    return getCollapsedHtml(html, 10);
  }, [html]);

  const activeHtml = isOpened ? html : collapsedHtml;

  useEffect(() => {
    if (!isActive) {
      setIsOpened(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (prevCodeRef.current !== code) {
      prevCodeRef.current = code;
      setIsDynamicReady(Boolean(code && isCodeBlockCached("tsx", code)));
      setIsOpened(false);
    }
  }, [code]);

  let codeBlockNode: ReactNode;
  if (activeHtml) {
    codeBlockNode = (
      <CodeBlock className="my-0" code={code} icon={<ReactIcon />} title={path}>
        <div
          className="w-full text-sm [&_pre]:p-4 [&_pre]:focus-visible:outline-none"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: pre-highlighted code html generated at build time
          dangerouslySetInnerHTML={{ __html: activeHtml }}
          data-code-block
        />
      </CodeBlock>
    );
  } else if (code === undefined || !shouldRenderCode) {
    codeBlockNode = (
      <CodeBlock
        allowCopy={false}
        className="my-0"
        icon={<ReactIcon />}
        title={path}
      >
        <Pre
          className="flex items-center justify-center text-muted-foreground"
          style={{ minHeight: "128px" }}
        >
          <span className="text-sm">Loading...</span>
        </Pre>
      </CodeBlock>
    );
  } else {
    codeBlockNode = (
      <DynamicCodeBlock
        code={code}
        icon={<ReactIcon />}
        lang="tsx"
        loadingMinHeight={128}
        onLoaded={() => setIsDynamicReady(true)}
        title={path}
      />
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ contain: "paint" }}>
      <motion.div
        animate={{ height: isOpened && isCodeReady ? "auto" : 128 }}
        className="overflow-hidden"
        initial={false}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <div className="[&_code]:pb-16 [&_pre]:my-0 [&_pre]:max-h-[650px] [&_pre]:p-4 [&_pre]:focus-visible:outline-none">
          {codeBlockNode}
        </div>
      </motion.div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center pb-3 transition-[height,background] duration-300",
          isOpened && isCodeReady
            ? "h-16 bg-gradient-to-t from-background/90 via-background/40 to-transparent"
            : "h-24 bg-gradient-to-t from-background via-background/80 to-transparent"
        )}
      >
        <Button
          className="pointer-events-auto h-7 rounded-full border border-border/60 bg-background/95 px-3 text-xs shadow-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!isCodeReady}
          onClick={() => {
            if (isCodeReady) {
              setIsOpened(!isOpened);
            }
          }}
          type="button"
          variant="secondary"
        >
          {getExpandButtonContent(isCodeReady, isOpened)}
        </Button>
      </div>
    </div>
  );
};

export const ComponentManualInstallation = ({
  path,
  dependencies,
  devDependencies,
  registryDependencies,
  code,
  html,
  isActive = true,
  beforeSteps,
  afterSteps,
  children,
  shouldRenderCode = true,
}: ComponentManualInstallationProps) => {
  const depsKey = dependencies?.join(",") ?? "";
  const devDepsKey = devDependencies?.join(",") ?? "";
  const regDepsKey = registryDependencies?.join(",") ?? "";

  // biome-ignore lint/correctness/useExhaustiveDependencies: depsKey tracks dependency changes stably
  const depsCommands = useMemo(() => getDepsCommands(dependencies), [depsKey]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: devDepsKey tracks dependency changes stably
  const devDepsCommands = useMemo(
    () => getDepsCommands(devDependencies),
    [devDepsKey]
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: regDepsKey tracks dependency changes stably
  const registryDepsCommands = useMemo(
    () => getRegistryDepsCommands(registryDependencies),
    [regDepsKey]
  );

  return (
    <div className="mt-0 [&_h4]:mt-0!">
      <Steps>
        {beforeSteps}

        {depsCommands && (
          <Step>
            <h4 className="pt-1 pb-4">Install the following dependencies:</h4>
            <CodeTabs codes={depsCommands} />
          </Step>
        )}

        {devDepsCommands && (
          <Step>
            <h4 className="pt-1 pb-4">
              Install the following dev dependencies:
            </h4>
            <CodeTabs codes={devDepsCommands} />
          </Step>
        )}

        {registryDepsCommands && (
          <Step>
            <h4 className="pt-1 pb-4">
              Install the following registry dependencies:
            </h4>
            <CodeTabs codes={registryDepsCommands} />
          </Step>
        )}

        {(code !== undefined || Boolean(path)) && (
          <Step>
            <h4 className="pt-1 pb-4">
              Copy and paste the following code into your project:
            </h4>
            <ManualCodeViewer
              code={code}
              html={html}
              isActive={isActive}
              key={path || "manual-viewer"}
              path={path}
              shouldRenderCode={shouldRenderCode}
            />
          </Step>
        )}

        <Step>
          <h4 className="pt-1 pb-4">
            Update the import paths to match your project setup.
          </h4>
        </Step>

        {children}
        {afterSteps}
      </Steps>
    </div>
  );
};
