import { ImageResponse } from "next/og";
import { OgImageFrame } from "@/lib/og/og-image-frame";
import type { OgPageContent } from "@/lib/og/resolve-og-page";
import {
  getOgSfProDisplayFontData,
  OG_FONT_FAMILY,
} from "@/lib/og/sf-pro-display-font";

export async function createOgImageResponse(
  content: OgPageContent
): Promise<ImageResponse> {
  return new ImageResponse(<OgImageFrame {...content} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: OG_FONT_FAMILY,
        data: await getOgSfProDisplayFontData(),
        style: "normal",
        weight: 500,
      },
    ],
  });
}
