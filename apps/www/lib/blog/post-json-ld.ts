import type { BlogPage } from "@/lib/blog/source";
import { SORA_UI_PUBLISHER_JSON_LD } from "@/lib/json-ld";
import { getBlogPostOgImagePath } from "@/lib/og/get-blog-og-image-path";
import { SITE_URL } from "@/lib/site";

export function getBlogPostJsonLd(page: BlogPage) {
  const slug = page.slugs[0] ?? "post";
  const url = `${SITE_URL}${page.url}`;
  const published = new Date(page.data.date).toISOString();
  const modified = page.data.lastModified
    ? new Date(page.data.lastModified).toISOString()
    : published;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.data.title,
    description: page.data.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: published,
    dateModified: modified,
    author: {
      "@type": "Person",
      name: page.data.author,
    },
    publisher: SORA_UI_PUBLISHER_JSON_LD,
    image: `${SITE_URL}${getBlogPostOgImagePath(slug)}`,
    inLanguage: "en",
  };
}
