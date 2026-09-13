"use client";

import ReactIcon from "@workspace/ui/components/icons/react-icon";
import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useState } from "react";
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

export interface ComponentManualInstallationProps {
  afterSteps?: ReactNode;
  beforeSteps?: ReactNode;
  children?: ReactNode;
  code?: string;
  dependencies?: string[];
  devDependencies?: string[];
  path?: string;
  registryDependencies?: string[];
}

export const ComponentManualInstallation = ({
  path,
  dependencies,
  devDependencies,
  registryDependencies,
  code,
  beforeSteps,
  afterSteps,
  children,
}: ComponentManualInstallationProps) => {
  const depsCommands = getDepsCommands(dependencies);
  const devDepsCommands = getDepsCommands(devDependencies);
  const registryDepsCommands = getRegistryDepsCommands(registryDependencies);

  const [isOpened, setIsOpened] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="-mt-6">
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

        {code && (
          <Step>
            <h4 className="pt-1 pb-4">
              Copy and paste the following code into your project:
            </h4>

            <div className="relative overflow-hidden">
              <motion.div
                animate={{ height: isOpened ? "auto" : 128 }}
                className="overflow-hidden"
                initial={false}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <div
                  className={cn(
                    "[&_code]:pb-16 [&_pre]:my-0 [&_pre]:max-h-[650px]"
                  )}
                >
                  <DynamicCodeBlock
                    code={code}
                    icon={<ReactIcon />}
                    lang="tsx"
                    title={path}
                  />
                </div>
              </motion.div>

              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center pb-3 transition-[height,background] duration-300",
                  isOpened
                    ? "h-16 bg-gradient-to-t from-background/90 via-background/40 to-transparent"
                    : "h-24 bg-gradient-to-t from-background via-background/80 to-transparent"
                )}
              >
                <Button
                  className="pointer-events-auto h-7 rounded-full border border-border/40 bg-background/80 px-3 text-xs shadow-xs backdrop-blur-sm hover:bg-accent"
                  onClick={() => setIsOpened(!isOpened)}
                  type="button"
                  variant="secondary"
                >
                  {isOpened ? "Collapse" : "Expand"}
                </Button>
              </div>
            </div>
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
