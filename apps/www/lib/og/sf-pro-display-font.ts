import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Registered name — must match `font-family` in `app/sf-pro-display.css`. */
export const OG_FONT_FAMILY = "SF Pro Display";

const sfProMediumPath = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  "public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYMEDIUM.OTF"
);

let sfProMediumData: Promise<ArrayBuffer> | undefined;

/** SF Pro Display Medium (500) for `next/og` — hoisted read, shared across OG requests. */
export function getOgSfProDisplayFontData(): Promise<ArrayBuffer> {
  if (!sfProMediumData) {
    sfProMediumData = readFile(sfProMediumPath).then((buffer) => {
      const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
      return arrayBuffer.slice(
        byteOffset,
        byteOffset + byteLength
      ) as ArrayBuffer;
    });
  }

  return sfProMediumData;
}
