"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CodeTabs } from "@/components/docs/code-tabs";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@/registry/primitives/animate/tabs";

const CLIENTS = [
  { id: "cursor", label: "Cursor" },
  { id: "claude", label: "Claude Code" },
  { id: "vscode", label: "VS Code" },
] as const;

const CLIENT_COMMANDS: Record<
  (typeof CLIENTS)[number]["id"],
  Record<string, string>
> = {
  cursor: {
    pnpm: "pnpm dlx shadcn@latest mcp init --client cursor",
    npm: "npx shadcn@latest mcp init --client cursor",
    yarn: "yarn shadcn@latest mcp init --client cursor",
    bun: "bunx --bun shadcn@latest mcp init --client cursor",
  },
  claude: {
    pnpm: "pnpm dlx shadcn@latest mcp init --client claude",
    npm: "npx shadcn@latest mcp init --client claude",
    yarn: "yarn shadcn@latest mcp init --client claude",
    bun: "bunx --bun shadcn@latest mcp init --client claude",
  },
  vscode: {
    pnpm: "pnpm dlx shadcn@latest mcp init --client vscode",
    npm: "npx shadcn@latest mcp init --client vscode",
    yarn: "yarn shadcn@latest mcp init --client vscode",
    bun: "bunx --bun shadcn@latest mcp init --client vscode",
  },
};

export interface McpInitTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: (typeof CLIENTS)[number]["id"];
}

export function McpInitTabs({
  className,
  defaultValue = "cursor",
  ...props
}: McpInitTabsProps) {
  return (
    <div className={cn("relative my-4", className)} {...props}>
      <Tabs
        className="w-full gap-0 overflow-hidden rounded-xl border border-border/60"
        defaultValue={defaultValue}
      >
        <div className="flex h-10 items-center border-border/50 border-b px-3">
          <TabsList className="flex items-center gap-0.5">
            <TabsHighlight
              className="h-full rounded-md bg-muted"
              containerClassName="relative isolate flex items-center gap-0.5"
              mode="parent"
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {CLIENTS.map((client) => (
                <TabsHighlightItem key={client.id} value={client.id}>
                  <TabsTrigger
                    className="relative z-10 h-7 rounded-md px-3 text-muted-foreground text-sm transition-colors data-[state=active]:text-foreground"
                    value={client.id}
                  >
                    {client.label}
                  </TabsTrigger>
                </TabsHighlightItem>
              ))}
            </TabsHighlight>
          </TabsList>
        </div>

        <TabsContents>
          {CLIENTS.map((client) => (
            <TabsContent className="p-1.5" key={client.id} value={client.id}>
              <CodeTabs
                className="rounded-lg border-0"
                codes={CLIENT_COMMANDS[client.id]}
                lang="bash"
              />
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>
    </div>
  );
}
