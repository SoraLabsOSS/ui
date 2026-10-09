/** Icon path from `@workspace/ui/components/icons/sora-icon` — shared for `next/og` (no client Motion). */
import { SORA_LOGO_PATH } from "@workspace/ui/components/icons/sora-icon";
import { OG_FONT_FAMILY } from "@/lib/og/sf-pro-display-font";

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
          <path d={SORA_LOGO_PATH} />
        </g>
      </svg>
      <p
        style={{
          fontFamily: OG_FONT_FAMILY,
          letterSpacing: "-1.5px",
          marginLeft: 12,
        }}
        tw="text-white text-5xl font-bold"
      >
        Sora UI
      </p>
    </div>
  );
}
