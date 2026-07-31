"use client";

import { useEffect } from "react";

const STYLE_ID = "sora-arrow-right-styles";

const ARROW_RIGHT_CSS = `
svg[data-arrow-right] { transition: transform 0.3s ease; }
svg[data-arrow-right][data-hover]:hover,
.group:hover svg[data-arrow-right][data-group-hover],
svg[data-arrow-right][data-animate] {
  transform: translateX(var(--sora-arrow-nudge, 2px));
}
svg[data-arrow-right][data-hover]:hover path,
.group:hover svg[data-arrow-right][data-group-hover] path,
svg[data-arrow-right][data-animate] path {
  animation: sora-arrow-right-dash var(--sora-arrow-duration, 0.8s) linear forwards;
}
svg[data-arrow-right][data-loop] path { animation-iteration-count: infinite; }
@keyframes sora-arrow-right-dash {
  0% { stroke-dasharray: 0, 20; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 10, 10; stroke-dashoffset: -5; }
  100% { stroke-dasharray: 20, 0; stroke-dashoffset: -10; }
}
@media (prefers-reduced-motion: reduce) {
  svg[data-arrow-right],
  svg[data-arrow-right][data-hover]:hover,
  .group:hover svg[data-arrow-right][data-group-hover],
  svg[data-arrow-right][data-animate] {
    transform: none;
    transition: none;
  }
  svg[data-arrow-right][data-hover]:hover path,
  .group:hover svg[data-arrow-right][data-group-hover] path,
  svg[data-arrow-right][data-animate] path {
    animation: none;
  }
}
`;

function ensureArrowRightStyles() {
  if (typeof document === "undefined") {
    return;
  }
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = ARROW_RIGHT_CSS;
}

interface ArrowRightProps extends Omit<React.SVGProps<SVGSVGElement>, "color"> {
  /**
   * Play the stroke-draw animation immediately on mount. Remount (change the
   * `key`) to replay — this is what the /icons preview panel drives.
   * @default false
   */
  animate?: boolean | string;
  /**
   * Play the animation while an ancestor with the `group` class is hovered.
   * Add `group` to the enclosing button (like the source CTA) to trigger it.
   * @default true
   */
  animateOnGroupHover?: boolean;
  /**
   * Play the animation while the icon itself is hovered.
   * @default true
   */
  animateOnHover?: boolean;
  /** Ignored — accepted for parity with the /icons gallery controls. */
  animation?: string;
  /**
   * Any valid CSS color, mapped to the SVG `stroke`.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Duration of the stroke-draw animation, in seconds.
   * @default 0.8
   */
  duration?: number;
  /**
   * Repeat the stroke-draw animation indefinitely.
   * @default false
   */
  loop?: boolean;
  /**
   * Horizontal shift of the arrow while animating, in pixels.
   * @default 2
   */
  nudge?: number;
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 24
   */
  size?: number | string;
}

function ArrowRight({
  size = 24,
  color = "currentColor",
  animate,
  animateOnHover = true,
  animateOnGroupHover = true,
  loop,
  duration,
  nudge,
  animation: _animation,
  strokeWidth = 1.5,
  className,
  style,
  ...props
}: ArrowRightProps) {
  useEffect(() => {
    ensureArrowRightStyles();
  }, []);

  const styleVars = {
    ...(duration !== undefined && { "--sora-arrow-duration": `${duration}s` }),
    ...(nudge !== undefined && { "--sora-arrow-nudge": `${nudge}px` }),
    ...style,
  } as React.CSSProperties;

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-animate={animate ? "" : undefined}
      data-arrow-right=""
      data-group-hover={animateOnGroupHover ? "" : undefined}
      data-hover={animateOnHover ? "" : undefined}
      data-loop={loop ? "" : undefined}
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      style={styleVars}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export {
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  type ArrowRightProps,
  type ArrowRightProps as ArrowRightIconProps,
};
