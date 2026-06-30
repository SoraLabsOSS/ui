/** Shared Sora UI OG image palette (matches apps/www `og-image-frame`). */
export const OG_PALETTE = {
  accent: "#FB460D",
  background: "#121212",
  borderMuted: "#404040",
  borderSubtle: "#171717",
  foreground: "#FAFAFA",
  foregroundMuted: "rgba(255, 255, 255, 0.6)",
} as const;

export type OgPalette = typeof OG_PALETTE;
