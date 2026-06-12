import { ImageResponse } from "next/og";
import type { OgImageFrame } from "@/lib/og/og-image-frame";
import { getOgOutfitFontData } from "@/lib/og/outfit-font";
import type { OgPageContent } from "@/lib/og/resolve-og-page";

export async function createOgImageResponse(
  content: OgPageContent
): Promise<ImageResponse> {
  return new ImageResponse(<OgImageFrame {...content} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Outfit",
        data: await getOgOutfitFontData(),
        style: "normal",
        weight: 500,
      },
    ],
  });
}
