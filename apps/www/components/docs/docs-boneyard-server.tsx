import type { ResponsiveBones, SkeletonResult } from "boneyard-js";
import { renderBones } from "boneyard-js";
import type { CSSProperties } from "react";

interface DocsBoneyardServerProps {
  bones: ResponsiveBones;
  name: string;
}

function getBreakpointStyle(
  name: string,
  breakpoint: number,
  index: number,
  breakpoints: number[]
): string {
  const selector = `[data-boneyard-ssr="${name}"] [data-boneyard-breakpoint="${breakpoint}"]`;
  const rules = [
    `${selector}{display:block}`,
    ...breakpoints
      .slice(0, index)
      .map(
        (previous) =>
          `[data-boneyard-ssr="${name}"] [data-boneyard-breakpoint="${previous}"]{display:none}`
      ),
  ];

  return index === 0
    ? rules.join("")
    : `@media (min-width:${breakpoint}px){${rules.join("")}}`;
}

export function DocsBoneyardServer({ bones, name }: DocsBoneyardServerProps) {
  const breakpoints = Object.keys(bones.breakpoints)
    .sort((a, b) => Number(a) - Number(b))
    .map(Number);

  if (breakpoints.length === 0) {
    return null;
  }

  const rootStyle: CSSProperties = { minHeight: 1 };
  const boneStyle = `
    [data-boneyard-ssr="${name}"] [data-boneyard-breakpoint] { display: none; }
    ${breakpoints
      .map((breakpoint, index) =>
        getBreakpointStyle(name, breakpoint, index, breakpoints)
      )
      .join("\n")}
    .dark [data-boneyard-ssr="${name}"] .boneyard-bone {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }
  `;

  return (
    <div aria-busy="true" data-boneyard-ssr={name} style={rootStyle}>
      <style>{boneStyle}</style>
      {breakpoints.map((breakpoint) => (
        <div data-boneyard-breakpoint={breakpoint} key={breakpoint}>
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Boneyard generates this trusted local snapshot HTML
            dangerouslySetInnerHTML={{
              __html: renderBones(
                bones.breakpoints[breakpoint] as SkeletonResult,
                "rgba(0, 0, 0, 0.08)",
                false
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}
