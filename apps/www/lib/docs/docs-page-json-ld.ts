import type { Page } from "@/lib/docs/source";
import { SORA_UI_PUBLISHER_JSON_LD } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";

function getBreadcrumbJsonLd(page: Page) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Docs",
        item: `${SITE_URL}/docs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.data.title,
        item: `${SITE_URL}${page.url}`,
      },
    ],
  };
}

export function getDocsPageJsonLd(page: Page) {
  const url = `${SITE_URL}${page.url}`;
  const modified = page.data.lastModified
    ? new Date(page.data.lastModified).toISOString()
    : undefined;

  const author = page.data.author as { name: string; url?: string } | undefined;

  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(modified && { datePublished: modified, dateModified: modified }),
    ...(author && {
      author: {
        "@type": "Person",
        name: author.name,
        ...(author.url && { url: author.url }),
      },
    }),
    publisher: SORA_UI_PUBLISHER_JSON_LD,
    inLanguage: "en",
  };

  return [techArticle, getBreadcrumbJsonLd(page)];
}
