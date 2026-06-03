'use client';

import { DynamicCodeBlock } from '@/components/docs/dynamic-codeblock';
import { CodeTabs } from '@/components/docs/code-tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import {
  Collapsible,
  CollapsibleTrigger,
} from 'fumadocs-ui/components/ui/collapsible';
import { Button } from '@workspace/ui/components/ui/button';
import { cn } from '@workspace/ui/lib/utils';
import { useState } from 'react';
import ReactIcon from '@workspace/ui/components/icons/react-icon';
import { motion } from 'motion/react';
import useMeasure from 'react-use-measure';

const COLLAPSED_HEIGHT = 128;

const getDepsCommands = (dependencies?: string[]) => {
  if (!dependencies) return undefined;
  return {
    npm: `npm install ${dependencies?.join(' ')}`,
    pnpm: `pnpm add ${dependencies?.join(' ')}`,
    yarn: `yarn add ${dependencies?.join(' ')}`,
    bun: `bun add ${dependencies?.join(' ')}`,
  };
};

const getRegistryDepsCommands = (dependencies?: string[]) => {
  if (!dependencies) return undefined;
  const quotedDependencies = dependencies
    .map((dep) => {
      if (dep.startsWith('https://ui.soralabs.io.vn/r/')) {
        return dep.replace('https://ui.soralabs.io.vn/r/', '@sora-ui/');
      }
      if (dep.startsWith('https://')) {
        return `"${dep}"`;
      }
      return dep;
    })
    .join(' ');
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
  path: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  code: string;
}) => {
  const depsCommands = getDepsCommands(dependencies);
  const devDepsCommands = getDepsCommands(devDependencies);
  const registryDepsCommands = getRegistryDepsCommands(registryDependencies);

  const [isOpened, setIsOpened] = useState(false);
  const [measureRef, { height: contentHeight }] = useMeasure();

  return (
    <div className="-mt-6">
      <Steps>
        {dependencies && depsCommands && (
          <Step>
            <h4 className="pt-1 pb-4">Install the following dependencies:</h4>
            <CodeTabs codes={depsCommands} />
          </Step>
        )}

        {devDependencies && devDepsCommands && (
          <Step>
            <h4 className="pt-1 pb-4">
              Install the following dev dependencies:
            </h4>
            <CodeTabs codes={devDepsCommands} />
          </Step>
        )}

        {registryDependencies && registryDepsCommands && (
          <Step>
            <h4 className="pt-1 pb-4">
              Install the following registry dependencies:
            </h4>
            <CodeTabs codes={registryDepsCommands} />
          </Step>
        )}

        <Step>
          <h4 className="pt-1 pb-4">
            Copy and paste the following code into your project:
          </h4>

          <Collapsible open={isOpened} onOpenChange={setIsOpened}>
            <div className="relative overflow-hidden">
              <motion.div
                className="overflow-hidden"
                initial={false}
                animate={{
                  height: isOpened
                    ? Math.max(contentHeight, COLLAPSED_HEIGHT)
                    : COLLAPSED_HEIGHT,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <div
                  ref={measureRef}
                  className="[&_code]:pb-[60px] [&_pre]:my-0 [&_pre]:max-h-[650px] [&_pre]:overflow-auto"
                >
                  <DynamicCodeBlock
                    code={code}
                    lang="tsx"
                    title={path}
                    icon={<ReactIcon />}
                  />
                </div>
              </motion.div>
              <div
                className={cn(
                  'to-background/95 dark:to-background/95 absolute flex items-center justify-center rounded-t-xl bg-gradient-to-b from-transparent p-2',
                  isOpened ? 'inset-x-0 bottom-0 h-14' : 'inset-0',
                )}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="secondary"
                    className="border-border/40 h-7 rounded-full border px-3 text-xs shadow-sm"
                  >
                    {isOpened ? 'Collapse' : 'Expand'}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </Collapsible>
        </Step>

        <Step>
          <h4 className="pt-1 pb-4">
            Update the import paths to match your project setup.
          </h4>
        </Step>
      </Steps>
    </div>
  );
};
