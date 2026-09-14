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

import { motion, useReducedMotion, type SVGMotionProps } from "motion/react";
import { useState } from "react";

interface ${exportName}Props extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 24
   */
  size?: number | string;
  /**
   * Any valid CSS color, mapped to the SVG \`stroke\`.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Whether to trigger the animation.
   * @default false
   */
  animate?: boolean;
  /**
   * Play the animation when the icon is hovered.
   * @default true
   */
  animateOnHover?: boolean;
  /**
   * Repeat the animation indefinitely.
   * @default false
   */
  loop?: boolean;
}

function ${exportName}({
  size = 24,
  color = "currentColor",
  animate = false,
  animateOnHover = true,
  loop = false,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ${exportName}Props) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const isTriggered = animate || (animateOnHover && isHovered);

  if (reducedMotion) {
    return (
      <motion.svg
        aria-hidden="true"
        className={className}
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
      className={className}
      fill="none"
      height={size}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (typeof onMouseEnter === "function") {
          onMouseEnter(e);
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (typeof onMouseLeave === "function") {
          onMouseLeave(e);
        }
      }}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.g
        animate={
          isTriggered
            ? {
                scale: [1, 1.15, 1],
                transition: {
                  duration: 0.5,
                  ease: "easeInOut",
                  repeat: loop ? Number.POSITIVE_INFINITY : 0,
                },
              }
            : { scale: 1 }
        }
        initial={{ scale: 1 }}
        style={{ transformOrigin: "center" }}
      >
        <circle cx="12" cy="12" r="9" />
      </motion.g>
    </motion.svg>
  );
}

export {
  ${exportName},
  ${exportName} as ${exportName}Icon,
  type ${exportName}Props,
  type ${exportName}Props as ${exportName}IconProps,
};
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
    registryDependencies: [],
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
