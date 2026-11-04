import { readFile } from "node:fs/promises";
import path from "node:path";
import { SORA_LOGO_PATH } from "@workspace/ui/components/icons/sora-icon";
import { OG_PALETTE } from "@workspace/ui/components/og/palette";
import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

/** Registered name — must match `font-family` in `app/sf-pro-display.css`. */
export const OG_FONT_FAMILY = "SF Pro Display";

const FONT_PUBLIC_PATH =
  "/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYMEDIUM.OTF";

const FONT_FILE_PATH = path.join(
  process.cwd(),
  "public",
  "fonts",
  "sf-pro-display-cdnfonts",
  "SFPRODISPLAYMEDIUM.OTF"
);

let sfProMediumData: Promise<ArrayBuffer> | undefined;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
  return arrayBuffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
}

async function loadFontFromDisk(): Promise<ArrayBuffer> {
  const buffer = await readFile(FONT_FILE_PATH);
  return toArrayBuffer(buffer);
}

async function loadFontFromPublicUrl(): Promise<ArrayBuffer> {
  const response = await fetch(`${getMetadataBaseUrl()}${FONT_PUBLIC_PATH}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch OG font (${response.status})`);
  }

  return response.arrayBuffer();
}

/** SF Pro Display Medium (500) for `next/og`. */
export function getOgSfProDisplayFontData(): Promise<ArrayBuffer> {
  if (!sfProMediumData) {
    sfProMediumData = loadFontFromDisk().catch(() => loadFontFromPublicUrl());
  }

  return sfProMediumData;
}

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

export interface OgPageContent {
  description?: string;
  title: string;
}

export function OgImageFrame({ title, description }: OgPageContent) {
  return (
    <div
      style={{ backgroundColor: OG_PALETTE.background }}
      tw="relative flex w-full h-full"
    >
      <div
        style={{ backgroundColor: OG_PALETTE.borderSubtle }}
        tw="absolute left-15 top-0 bottom-0 w-0.5 h-full"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderSubtle }}
        tw="absolute right-15 top-0 bottom-0 w-0.5 h-full"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderSubtle }}
        tw="absolute bottom-15 left-0 right-0 w-full h-0.5"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderSubtle }}
        tw="absolute top-15 left-0 right-0 w-full h-0.5"
      />

      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute top-15 left-[43.5px] w-[35px] h-0.5"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute left-15 top-[43.5px] h-[35px] w-0.5"
      />

      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute bottom-15 left-[43.5px] w-[35px] h-0.5"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute left-15 bottom-[43.5px] h-[35px] w-0.5"
      />

      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute top-15 right-[43.5px] w-[35px] h-0.5"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute right-15 top-[43.5px] h-[35px] w-0.5"
      />

      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute bottom-15 right-[43.5px] w-[35px] h-0.5"
      />
      <div
        style={{ backgroundColor: OG_PALETTE.borderMuted }}
        tw="absolute right-15 bottom-[43.5px] h-[35px] w-0.5"
      />

      <div
        style={{
          backgroundSize: "100px 100px",
        }}
        tw="flex flex-col w-full h-full items-start justify-between p-26"
      >
        <OgSoraUiBrand />

        <div
          style={{ gap: 40 }}
          tw="flex flex-row w-full justify-between items-end"
        >
          <div tw="flex flex-col">
            <p
              style={{ fontFamily: OG_FONT_FAMILY }}
              tw="text-white text-6xl font-medium mb-0"
            >
              {title}
            </p>
            {description ? (
              <p
                style={{ fontFamily: OG_FONT_FAMILY }}
                tw="text-white/60 text-2xl mt-6 -mb-2 max-w-2xl"
              >
                {description}
              </p>
            ) : null}
          </div>

          <div tw="flex ml-6">
            <p
              style={{ fontFamily: OG_FONT_FAMILY }}
              tw="text-white/80 text-2xl -mb-2"
            >
              {new URL(SITE_URL).host}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
