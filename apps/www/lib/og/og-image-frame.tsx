import { OG_PALETTE } from "@workspace/ui/components/og/palette";
import type { OgPageContent } from "@/lib/og/resolve-og-page";
import { OG_FONT_FAMILY } from "@/lib/og/sf-pro-display-font";
import { OgSoraUiBrand } from "@/lib/og/sora-ui-brand";
import { SITE_URL } from "@/lib/site";

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
