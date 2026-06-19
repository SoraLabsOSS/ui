import { readFile } from "node:fs/promises";
import path from "node:path";
import { getMetadataBaseUrl } from "@/lib/site";

/** Registered name for `next/og` font embedding. */
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
