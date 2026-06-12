import type { Metadata } from "next";
import { getOgImagePath } from "@/lib/og/get-og-image-path";

const OG_SIZE = { width: 1200, height: 630 } as const;

export function getOgMetadataImages(
  pathSegments: string[],
  alt: string
): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: getOgImagePath(...pathSegments),
      ...OG_SIZE,
      alt,
    },
  ];
}

export function getTwitterMetadataImages(pathSegments: string[]): string[] {
  return [getOgImagePath(...pathSegments)];
}
