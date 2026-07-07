import { ShadcnRegistry3 } from "@workspace/ui/components/og/shadcn-registry-3";
import { ImageResponse } from "next/og";
import type { BlogOgContent } from "@/lib/og/blog-og-types";
import { resolveOgImageSrc } from "@/lib/og/resolve-og-image-src";
import {
  getOgSfProDisplayFontData,
  OG_FONT_FAMILY,
} from "@/lib/og/sf-pro-display-font";

const BLOG_OG_GHOST = "Sora - UI";
const BLOG_OG_CREDIT = "Developed By @axyl1410";

function toRegistryProps(content: BlogOgContent, logo: string | undefined) {
  return {
    title: content.quote,
    description: content.description,
    credit: BLOG_OG_CREDIT,
    ghost: BLOG_OG_GHOST,
    logo: logo ?? "",
  };
}

export async function createBlogOgImageResponse(
  content: BlogOgContent
): Promise<ImageResponse> {
  const logo = await resolveOgImageSrc(content.avatar);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontFamily: OG_FONT_FAMILY,
        height: "100%",
        width: "100%",
      }}
    >
      <ShadcnRegistry3 {...toRegistryProps(content, logo)} />
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
