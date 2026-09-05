import { cn } from "@workspace/ui/lib/utils";
import { Card } from "fumadocs-ui/components/card";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import {
  Changelog,
  ChangelogItem,
  ChangelogItemDescription,
  ChangelogItemTitle,
  ChangelogItemVersion,
} from "@/components/docs/changelog";
import { ExternalLink } from "@/components/docs/external-link";
import { PrimitivesIndex } from "@/components/docs/primitives-index";
import { SoraTypeTable } from "@/components/docs/sora-type-table";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/radix/tabs";
import { RoadmapTimeline } from "@/components/ui/roadmap-timeline";
import { UiIndex } from "@/components/ui/ui-index";
import { Callout } from "./components/docs/callout";
import {
  CodeBlock,
  type CodeBlockProps,
  Pre,
} from "./components/docs/codeblock";

const ComponentCredits = dynamic(() =>
  import("@/components/docs/component-credits").then((m) => ({
    default: m.ComponentCredits,
  }))
);

const ComponentInstallation = dynamic(() =>
  import("@/components/docs/component-installation").then((m) => ({
    default: m.ComponentInstallation,
  }))
);

const InstallationFileStructure = dynamic(() =>
  import("@/components/docs/installation-file-structure").then((m) => ({
    default: m.InstallationFileStructure,
  }))
);

const ComponentPreview = dynamic(() =>
  import("@/components/docs/component-preview").then((m) => ({
    default: m.ComponentPreview,
  }))
);

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
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
    InstallationFileStructure,
    ComponentCredits,
    PrimitivesIndex,
    UiIndex,
    RoadmapTimeline,
    Changelog,
    ChangelogItem,
    ChangelogItemVersion,
    ChangelogItemTitle,
    ChangelogItemDescription,
    TypeTable: SoraTypeTable,
    ExternalLink,
    Steps,
    Step,
    Callout,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContents,
    TabsContent,
    Tab,
    ImageZoom,
    img: (props: ComponentProps<typeof ImageZoom>) => (
      <ImageZoom
        {...props}
        className={cn("rounded-lg border border-border/60", props.className)}
      />
    ),
    pre: (props: CodeBlockProps) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    // caller-supplied overrides win (e.g. getCatalogMDXComponents)
    ...components,
  };
}
