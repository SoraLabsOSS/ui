import { toPascalCase, toTitleCase } from "./naming.js";

export interface IconScaffoldLabels {
  demoExportName: string;
  description: string;
  exportName: string;
  keywords: string[];
  name: string;
  registryName: string;
  releaseDate: string;
  title: string;
}

export function buildIconLabels(
  name: string,
  keywords?: string[]
): IconScaffoldLabels {
  const exportName = toPascalCase(name);
  const derivedKeywords = Array.from(
    new Set([...name.split("-"), "icon", "animated", "motion"])
  );

  return {
    name,
    title: toTitleCase(name),
    description: `Animated ${toTitleCase(name).toLowerCase()} icon powered by Motion.`,
    exportName,
    demoExportName: `${exportName}Demo`,
    registryName: `icons-${name}`,
    keywords: keywords && keywords.length > 0 ? keywords : derivedKeywords,
    releaseDate: new Date().toISOString().slice(0, 10),
  };
}

export function renderIconIndex(_name: string, exportName: string): string {
  return `"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
  useAnimateIconVariants,
} from "@/registry/icons/icon";

export type ${exportName}Props = IconProps<keyof typeof animations, never>;

const animations = {
  default: {
    group: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.15, 1],
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
  },
} satisfies Record<string, Variants>;

function IconComponent({ size = 24, color = "currentColor", ...props }: ${exportName}Props) {
  const { controls } = useAnimateIconContext();
  const variants = useAnimateIconVariants(animations);
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <motion.svg
        aria-hidden="true"
        fill="none"
        height={size}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="12" cy="12" r="9" />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      animate={controls}
      aria-hidden="true"
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      variants={variants.group}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
    </motion.svg>
  );
}

export function ${exportName}(props: ${exportName}Props) {
  return (
    <IconWrapper
      animate={props.animate}
      animation={props.animation}
      controls={props.controls}
      loop={props.loop}
    >
      <IconComponent {...props} />
    </IconWrapper>
  );
}

export { ${exportName} as ${exportName}Icon };
`;
}

export function renderIconRegistryItem(
  name: string,
  title: string,
  description: string,
  keywords: string[],
  releaseDate: string
): string {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `icons-${name}`,
    type: "registry:ui",
    title,
    description,
    dependencies: ["motion"],
    registryDependencies: ["@soralabs/icons-icon"],
    files: [
      {
        path: `registry/icons/${name}/index.tsx`,
        type: "registry:ui",
        target: `components/sora-ui/icons/${name}.tsx`,
      },
    ],
    meta: {
      keywords,
      releaseDate,
    },
  };

  return `${JSON.stringify(item, null, 2)}\n`;
}

export function renderIconDemoIndex(
  name: string,
  exportName: string,
  demoExportName: string
): string {
  return `"use client";

import { ${exportName} } from "@/registry/icons/${name}";

export default function ${demoExportName}() {
  return (
    <div className="flex items-center justify-center p-8">
      <${exportName} size={32} />
    </div>
  );
}
`;
}

export function renderIconDemoRegistryItem(
  name: string,
  title: string
): string {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `demo-icons-${name}`,
    type: "registry:component",
    title: `${title} Demo`,
    registryDependencies: [`@soralabs/icons-${name}`],
    files: [
      {
        path: `registry/demo/icons/${name}/index.tsx`,
        type: "registry:component",
        target: `components/sora-ui/icons/${name}-demo.tsx`,
      },
    ],
  };

  return `${JSON.stringify(item, null, 2)}\n`;
}
