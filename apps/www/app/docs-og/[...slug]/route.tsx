import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { source } from "@/lib/docs/source";
import { getOgOutfitFontData } from "@/lib/og/outfit-font";
import { OgSoraUiBrand } from "@/lib/og/sora-ui-brand";
import { SITE_URL } from "@/lib/site";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }

  return new ImageResponse(
    <div tw="relative flex w-full h-full bg-[#0A0A0A]">
      <div tw="absolute left-15 top-0 bottom-0 w-0.5 h-full bg-[#171717]" />
      <div tw="absolute right-15 top-0 bottom-0 w-0.5 h-full bg-[#171717]" />
      <div tw="absolute bottom-15 left-0 right-0 w-full h-0.5 bg-[#171717]" />
      <div tw="absolute top-15 left-0 right-0 w-full h-0.5 bg-[#171717]" />

      <div tw="absolute top-15 left-[43.5px] w-[35px] h-0.5 bg-[#404040]" />
      <div tw="absolute left-15 top-[43.5px] h-[35px] w-0.5 bg-[#404040]" />

      <div tw="absolute bottom-15 left-[43.5px] w-[35px] h-0.5 bg-[#404040]" />
      <div tw="absolute left-15 bottom-[43.5px] h-[35px] w-0.5 bg-[#404040]" />

      <div tw="absolute top-15 right-[43.5px] w-[35px] h-0.5 bg-[#404040]" />
      <div tw="absolute right-15 top-[43.5px] h-[35px] w-0.5 bg-[#404040]" />

      <div tw="absolute bottom-15 right-[43.5px] w-[35px] h-0.5 bg-[#404040]" />
      <div tw="absolute right-15 bottom-[43.5px] h-[35px] w-0.5 bg-[#404040]" />

      <div
        style={{
          backgroundSize: "100px 100px",
        }}
        tw="flex flex-col w-full h-full items-start justify-between p-26"
      >
        <OgSoraUiBrand />

        <div tw="flex flex-row gap-10 w-full justify-between items-end">
          <div tw="flex flex-col">
            <p
              style={{ fontFamily: "Outfit" }}
              tw="text-white text-6xl font-medium mb-0"
            >
              {page.data.title}
            </p>
            {page.data.description ? (
              <p
                style={{ fontFamily: "Outfit" }}
                tw="text-white/60 text-2xl mt-6 -mb-2 max-w-2xl"
              >
                {page.data.description}
              </p>
            ) : null}
          </div>

          <div tw="flex ml-6">
            <p
              style={{ fontFamily: "Outfit" }}
              tw="text-white/80 text-2xl -mb-2"
            >
              {new URL(SITE_URL).host}
            </p>
          </div>
        </div>
      </div>
    </div>,
    {
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
    }
  );
}

export function generateStaticParams(): {
  slug: string[];
}[] {
  return source
    .generateParams()
    .filter((page) => {
      const pageData = source.getPage(page.slug);
      return pageData !== null && pageData !== undefined;
    })
    .map((page) => ({
      ...page,
      slug: [...page.slug, "image.png"],
    }));
}
