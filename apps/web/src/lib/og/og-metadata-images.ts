import type { Metadata } from "next";
import { getOgImagePath } from "@/lib/og/get-og-image-path";
import { getMetadataBaseUrl } from "@/lib/site";

const OG_SIZE = { width: 1200, height: 630 } as const;

function getAbsoluteOgImageUrl(pathSegments: string[]): string {
  return `${getMetadataBaseUrl()}${getOgImagePath(...pathSegments)}`;
}

export function getOgMetadataImages(
  pathSegments: string[],
  alt: string
): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: getAbsoluteOgImageUrl(pathSegments),
      ...OG_SIZE,
      alt,
    },
  ];
}

export function getTwitterMetadataImages(pathSegments: string[]): string[] {
  return [getAbsoluteOgImageUrl(pathSegments)];
}
