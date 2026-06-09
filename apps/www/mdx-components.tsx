import { cn } from "@workspace/ui/lib/utils";
import { Card } from "fumadocs-ui/components/card";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ComponentCredits } from "@/components/docs/component-credits";
import { ComponentInstallation } from "@/components/docs/component-installation";
import { ComponentPreview } from "@/components/docs/component-preview";
import { ExternalLink } from "@/components/docs/external-link";
import { Callout } from "./components/docs/callout";
import {
  CodeBlock,
  type CodeBlockProps,
  Pre,
} from "./components/docs/codeblock";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Card: ({ children, className, accent, ...props }) => (
      <Card
        className={cn(
          "flex flex-col items-center justify-center border-none bg-accent/50 py-7 [&>div]:border-none [&>div]:bg-transparent [&>div]:shadow-none [&>h3]:text-base [&>h3]:text-current [&_svg]:size-10",
          accent && "[&>h3]:text-fd-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    ),
    ComponentPreview,
    ComponentInstallation,
    ComponentCredits,
    TypeTable,
    ExternalLink,
    Steps,
    Step,
    Callout,
    pre: (props: CodeBlockProps) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
  };
}
