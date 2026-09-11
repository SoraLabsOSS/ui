"use client";

import ReactIcon from "@workspace/ui/components/icons/react-icon";
import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { Step, Steps } from "fumadocs-ui/components/steps";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "fumadocs-ui/components/ui/collapsible";
import { useRef, useState } from "react";
import { CodeTabs } from "@/components/docs/code-tabs";
import { DynamicCodeBlock } from "@/components/docs/dynamic-codeblock";

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
    yarn: `npx shadcn@latest add ${quotedDependencies}`,
    bun: `bun x --bun shadcn@latest add ${quotedDependencies}`,
  };
};

export const ComponentManualInstallation = ({
  path,
  dependencies,
  devDependencies,
  registryDependencies,
  code,
}: {
  path?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  code?: string;
}) => {
  const depsCommands = getDepsCommands(dependencies);
  const devDepsCommands = getDepsCommands(devDependencies);
  const registryDepsCommands = getRegistryDepsCommands(registryDependencies);

  const [isOpened, setIsOpened] = useState(false);
  const collapsibleRef = useRef<HTMLDivElement>(null);

  return (
    <div className="-mt-6">
      <Steps>
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

        {code && (
          <Step>
            <h4 className="pt-1 pb-4">
              Copy and paste the following code into your project:
            </h4>

            <Collapsible onOpenChange={setIsOpened} open={isOpened}>
              <div className="relative overflow-hidden" ref={collapsibleRef}>
                <CollapsibleContent
                  className={cn("overflow-hidden", !isOpened && "max-h-32")}
                  forceMount
                >
                  <div
                    className={cn(
                      "[&_code]:pb-[60px] [&_pre]:my-0 [&_pre]:max-h-[650px]"
                    )}
                  >
                    <DynamicCodeBlock
                      code={code}
                      icon={<ReactIcon />}
                      lang="tsx"
                      title={path}
                    />
                  </div>
                </CollapsibleContent>
                <div
                  className={cn(
                    "absolute flex items-center justify-center rounded-t-xl bg-gradient-to-b from-transparent to-background/95 p-2 dark:to-background/95",
                    isOpened ? "inset-x-0 bottom-0 h-14" : "inset-0"
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      className="h-7 rounded-full border border-border/40 px-3 text-xs"
                      variant="secondary"
                    >
                      {isOpened ? "Collapse" : "Expand"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </Collapsible>
          </Step>
        )}

        <Step>
          <h4 className="pt-1 pb-4">
            Update the import paths to match your project setup.
          </h4>
        </Step>
      </Steps>
    </div>
  );
};
