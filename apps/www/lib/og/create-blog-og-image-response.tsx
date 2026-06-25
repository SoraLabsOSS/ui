import { Quote } from "@workspace/ui/components/og/quote";
import { ImageResponse } from "next/og";
import type { BlogOgContent } from "@/lib/og/blog-og-types";
import { resolveOgImageSrc } from "@/lib/og/resolve-og-image-src";
import {
  getOgSfProDisplayFontData,
  OG_FONT_FAMILY,
} from "@/lib/og/sf-pro-display-font";

export async function createBlogOgImageResponse(
  content: BlogOgContent
): Promise<ImageResponse> {
  const avatar = await resolveOgImageSrc(content.avatar);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontFamily: OG_FONT_FAMILY,
        height: "100%",
        width: "100%",
      }}
    >
      <Quote {...content} avatar={avatar} />
    </div>,
    {
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
    }
  );
}
