"use client";

import { cn } from "@workspace/ui/lib/utils";
import { index } from "@/__registry__";
import { CodeTabs } from "@/components/docs/code-tabs";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/radix/tabs";
import { ComponentFileStructure } from "./component-file-structure";
import { ComponentManualInstallation } from "./component-manual-installation";

interface ComponentInstallationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

export function ComponentInstallation({
  name,
  className,
  ...props
}: ComponentInstallationProps) {
  const component = index[name];

  const shadcnCommands = {
    npm: `npx shadcn@latest add ${component.command}`,
    pnpm: `pnpm dlx shadcn@latest add ${component.command}`,
    yarn: `npx shadcn@latest add ${component.command}`,
    bun: `bun x --bun shadcn@latest add ${component.command}`,
  };

  const soraCliCommands = {
    npm: `npx @soralabsoss/sora-cli@latest add ${name}`,
    pnpm: `pnpm dlx @soralabsoss/sora-cli@latest add ${name}`,
    yarn: `npx @soralabsoss/sora-cli@latest add ${name}`,
    bun: `bun x --bun @soralabsoss/sora-cli@latest add ${name}`,
  };

  return (
    <div
      className={cn(
        "relative mt-2 flex flex-col space-y-3 lg:max-w-[120ch]",
        className
      )}
      {...props}
    >
      <Tabs className="relative mr-auto w-full" defaultValue="sora-cli">
        <TabsList>
          <TabsTrigger value="sora-cli">sora-cli</TabsTrigger>
          <TabsTrigger value="shadcn">shadcn</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="sora-cli">
            <CodeTabs codes={soraCliCommands} />
          </TabsContent>
          <TabsContent value="shadcn">
            <CodeTabs codes={shadcnCommands} />
          </TabsContent>
          <TabsContent value="manual">
            <ComponentManualInstallation
              code={component.files[0].content}
              dependencies={component.dependencies}
              devDependencies={component.devDependencies}
              path={component.files[0].target}
              registryDependencies={component.registryDependencies}
            />
          </TabsContent>
        </TabsContents>
      </Tabs>

      <ComponentFileStructure name={name} />
    </div>
  );
}
