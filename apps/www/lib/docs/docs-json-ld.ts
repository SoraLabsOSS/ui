import type { Page } from "@/lib/docs/source";
import { SORA_UI_PUBLISHER_JSON_LD } from "@/lib/json-ld";
import type { ComponentDocPage } from "@/lib/registry/component-source";
import { SITE_URL } from "@/lib/site";

export function getComponentPageJsonLd(
  page: ComponentDocPage,
  componentUrl: string
) {
  const url = `${SITE_URL}${componentUrl}`;
  const modified = (page.data as { lastModified?: Date | string | number })
    .lastModified;
  const modifiedIso = modified ? new Date(modified).toISOString() : undefined;

  const author = (page.data as { author?: { name: string; url?: string } })
    .author;

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(modifiedIso && {
      datePublished: modifiedIso,
      dateModified: modifiedIso,
    }),
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
}

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
