import type { ComponentPropsWithRef } from "react";

/**
 * Renders the Figma logo as an inline SVG icon with built-in accessibility attributes.
 *
 * The icon uses role="img" and aria-label="Figma" for screen readers and contains
 * five colored paths representing the Figma brand colors.
 *
 * @param props - Props forwarded to the root `<svg>` element
 * @returns An accessible SVG element containing the multicolor Figma logo
 */
export function Figma(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      aria-label="Figma"
      role="img"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M45.5 129c11.9 0 21.5-9.6 21.5-21.5V86H45.5C33.6 86 24 95.6 24 107.5S33.6 129 45.5 129m0 0"
        fill="#0acf83"
      />
      <path
        d="M24 64.5C24 52.6 33.6 43 45.5 43H67v43H45.5C33.6 86 24 76.4 24 64.5m0 0"
        fill="#a259ff"
      />
      <path
        d="M24 21.5C24 9.6 33.6 0 45.5 0H67v43H45.5C33.6 43 24 33.4 24 21.5m0 0"
        fill="#f24e1e"
      />
      <path
        d="M67 0h21.5C100.4 0 110 9.6 110 21.5S100.4 43 88.5 43H67zm0 0"
        fill="#ff7262"
      />
      <path
        d="M110 64.5c0 11.9-9.6 21.5-21.5 21.5S67 76.4 67 64.5S76.6 43 88.5 43S110 52.6 110 64.5m0 0"
        fill="#1abcfe"
      />
    </svg>
  );
}
