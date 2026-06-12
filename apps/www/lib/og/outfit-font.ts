/** Outfit Medium (500) for `next/og` — hoisted fetch, shared across OG requests. */
const OUTFIT_FONT_URL =
  "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4QK1C4E.ttf";

let outfitFontData: Promise<ArrayBuffer> | undefined;

export function getOgOutfitFontData(): Promise<ArrayBuffer> {
  if (!outfitFontData) {
    outfitFontData = fetch(OUTFIT_FONT_URL).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load Outfit font for OG images: ${response.status}`
        );
      }

      return response.arrayBuffer();
    });
  }

  return outfitFontData;
}
