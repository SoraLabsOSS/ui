/** Icon path from `components/icon-logo.tsx` — shared for `next/og` (no client Motion). */
import { OG_FONT_FAMILY } from "@/lib/og/sf-pro-display-font";

const SORA_ICON_PATH =
  "M 150.245 -0.676 L 150.658 49.581 L 49.237 49.477 L 49.714 -0.758 L 150.245 -0.676 Z M 49.342 150.419 L 49.237 49.477 L -1.04 49.794 L -1.304 150.337 L 49.342 150.419 Z M 150.763 150.523 L 150.658 49.581 L 201.304 49.663 L 201.04 150.206 L 150.763 150.523 Z M 150.763 150.523 L 49.342 150.419 L 49.755 200.676 L 150.286 200.758 L 150.763 150.523 Z";

export function OgSoraUiBrand() {
  return (
    <div tw="flex flex-row items-center">
      <svg
        aria-hidden="true"
        fill="#fff"
        height="52"
        viewBox="0 0 200 200"
        width="52"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(100 100) scale(0.8292) translate(-100 -100)">
          <path d={SORA_ICON_PATH} />
        </g>
      </svg>
      <p
        style={{ fontFamily: OG_FONT_FAMILY, marginLeft: 12 }}
        tw="text-white text-5xl font-medium"
      >
        Sora UI
      </p>
    </div>
  );
}
