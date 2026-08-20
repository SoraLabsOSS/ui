import type { ComponentPropsWithRef } from "react";

/**
 * Renders the Vercel logo as an SVG icon.
 *
 * @param props - Props forwarded to the root `<svg>` element (e.g., className, style, width, height, aria-*).
 * @returns An SVG element representing the Vercel logo.
 */
export function Vercel(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      aria-label="Vercel"
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M23 21.648H1L12 2.352z" fill="currentColor" />
    </svg>
  );
}
