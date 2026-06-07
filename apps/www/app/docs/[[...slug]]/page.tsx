import { Footer } from "@workspace/ui/components/docs/footer";
import { Button } from "@workspace/ui/components/ui/button";
import { findNeighbour } from "fumadocs-core/server";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { baseOptions } from "@/app/layout.config";
import { DocsAuthor } from "@/components/docs/docs-author";
import { PageActionButtons } from "@/components/docs/page-actions";
import { DOCS_COMPONENTS_SECTION_URL } from "@/lib/docs/docs-nav-constants";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { source } from "@/lib/docs/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;

  const tree = source.getPageTree();
  const { previous, next: nextPage } = findNeighbour(tree, page.url);

  type GuideLink = { text: string; url: string };
  const isGuideLink = (l: unknown): l is GuideLink => {
    if (typeof l !== "object" || l === null) {
      return false;
    }
    const obj = l as Record<string, unknown>;
    return typeof obj.url === "string" && typeof obj.text === "string";
  };
  const guideItems = (baseOptions.links ?? []).filter(isGuideLink);
  const guideIndex = guideItems.findIndex((it) => it.url === page.url);
  const primitivesUrl = getFirstPrimitiveDocUrl();

  const prevNav = (() => {
    if (guideIndex >= 0 && guideItems.length > 0) {
      if (guideIndex > 0) {
        return {
          url: guideItems[guideIndex - 1].url,
          name: guideItems[guideIndex - 1].text,
        } as const;
      }
      return;
    }

    if (previous) {
      return {
        url: previous.url,
        name: String(previous.name ?? "Précédent"),
      } as const;
    }

    const isPrimitivesRoot = page.url === primitivesUrl;
    const isSectionRoot =
      page.url === DOCS_COMPONENTS_SECTION_URL || isPrimitivesRoot;

    if (isSectionRoot && guideItems.length > 0) {
      const last = guideItems[guideItems.length - 1];
      return { url: last.url, name: last.text } as const;
    }

    if (page.url.startsWith("/docs/primitives/")) {
      return { url: primitivesUrl, name: "Primitives" } as const;
    }
    if (page.url.startsWith("/docs/components/")) {
      return {
        url: DOCS_COMPONENTS_SECTION_URL,
        name: "Components",
      } as const;
    }

    return;
  })();

  const nextNav =
    guideIndex >= 0 && guideItems.length > 0
      ? guideIndex < guideItems.length - 1
        ? {
            url: guideItems[guideIndex + 1].url,
            name: guideItems[guideIndex + 1].text,
          }
        : { url: primitivesUrl, name: "Primitives" }
      : nextPage
        ? { url: nextPage.url, name: String(nextPage.name ?? "Suivant") }
        : undefined;

  return (
    <DocsPage
      footer={{
        component: (
          <Footer
            lastUpdate={
              page.data.lastModified
                ? new Date(page.data.lastModified)
                : undefined
            }
          />
        ),
      }}
      full={page.data.full}
      tableOfContent={{ style: "clerk" }}
      toc={page.data.toc}
    >
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <DocsTitle className="font-medium">{page.data.title}</DocsTitle>
        {(prevNav || nextNav) && (
          <div className="flex flex-row items-center gap-1.5 pt-0.5">
            <Link
              aria-disabled={!prevNav}
              aria-label={
                prevNav ? `Aller à ${prevNav.name}` : "Pas de page précédente"
              }
              className={prevNav ? undefined : "pointer-events-none opacity-50"}
              href={prevNav?.url ?? page.url}
            >
              <Button size="icon-sm" variant="accent">
                <ArrowLeft />
              </Button>
            </Link>
            <Link
              aria-disabled={!nextNav}
              aria-label={
                nextNav ? `Aller à ${nextNav.name}` : "Pas de page suivante"
              }
              className={nextNav ? undefined : "pointer-events-none opacity-50"}
              href={nextNav?.url ?? page.url}
            >
              <Button size="icon-sm" variant="accent">
                <ArrowRight />
              </Button>
            </Link>
          </div>
        )}
      </div>
      <DocsDescription className="mb-1 font-normal">
        {page.data.description}
      </DocsDescription>
      {page.data.author && (
        <DocsAuthor name={page.data.author.name} url={page.data.author?.url} />
      )}

      <PageActionButtons
        githubUrl={`https://github.com/axyl1410/sora/blob/main/apps/www/content/docs/${page.path}`}
        key={page.url}
        markdownUrl={`${page.url}.mdx`}
        url={page.url}
      />

      <DocsBody className="pt-4 pb-10" id="docs-body">
        <MDXContent
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await props.params;
  const page = source.getPage(slug);
  if (!page) {
    notFound();
  }

  const image = ["/docs-og", ...slug, "image.png"].join("/");

  return {
    title: page.data.title,
    description: page.data.description,
    authors: page.data?.author
      ? [
          {
            name: page.data.author.name,
            ...(page.data.author?.url && { url: page.data.author.url }),
          },
        ]
      : {
          name: "axyl1410",
          url: "https://github.com/axyl1410",
        },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: "https://ui.soralabs.io.vn",
      siteName: "Sora UI",
      images: image,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: image,
    },
  };
}
