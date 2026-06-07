import type { MetadataRoute } from "next";
import { source } from "@/lib/docs/source";
import { SITE_URL } from "@/lib/site";

function toLastModified(value: Date | string | number | undefined) {
  if (!value) {
    return;
  }

  return new Date(value);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const docEntries = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => ({
      url: `${SITE_URL}${page.url}`,
      lastModified: toLastModified(page.data.lastModified),
      changeFrequency: "weekly" as const,
      priority: page.url === "/docs" ? 0.9 : 0.7,
    }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docEntries,
  ];
}
