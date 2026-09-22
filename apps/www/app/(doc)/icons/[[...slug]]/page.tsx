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
import { DocsAuthor } from "@/components/docs/docs-author";
import { DocsBoneyardCapture } from "@/components/docs/docs-boneyard";
import { DocsHeaderToc } from "@/components/docs/docs-header-toc";
import { DocsPageJsonLd } from "@/components/docs/docs-page-json-ld";
import { Footer } from "@/components/docs/footer";
import { PageActionButtons } from "@/components/docs/page-actions";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { iconsSource } from "@/lib/icons/source";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { GITHUB_REPO_URL, getPageAlternates, SITE_URL } from "@/lib/site";
import { getFirstUiDocUrl } from "@/lib/ui/get-first-ui-doc-url";
import { getMDXComponents } from "@/mdx-components";

export default async function IconDocsPage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  if (!iconsSource.getPage(params.slug)) {
    notFound();
  }

  return <IconDocsPageBody slug={params.slug} />;
}

async function IconDocsPageBody({ slug }: { slug?: string[] }) {
  const page = iconsSource.getPage(slug);
  if (!page) {
    return null;
  }

  const MDXContent = page.data.body;
  const tree = iconsSource.getPageTree();
  const { previous, next: nextPage } = findNeighbour(tree, page.url);
  const primitivesUrl = getFirstPrimitiveDocUrl();
  const uiUrl = getFirstUiDocUrl();

  const prevNav = (() => {
    if (previous) {
      return {
        url: previous.url,
        name: String(previous.name ?? "Previous"),
      } as const;
    }

    if (page.url === "/icons") {
      return { url: primitivesUrl, name: "Motion" } as const;
    }

    if (page.url.startsWith("/icons/")) {
      return { url: "/icons", name: "Icons" } as const;
    }

    return;
  })();

  const nextNav = (() => {
    if (nextPage) {
      return { url: nextPage.url, name: String(nextPage.name ?? "Next") };
    }
    if (page.url === "/icons") {
      return { url: uiUrl, name: "UI" } as const;
    }
    return;
  })();

  return (
    <DocsBoneyardCapture name="icons-page">
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
        tableOfContentPopover={{
          component: <DocsHeaderToc />,
        }}
        toc={page.data.toc}
      >
        <DocsPageJsonLd page={page} />
        <div className="flex w-full flex-row items-start justify-between gap-2">
          <DocsTitle className="font-medium">{page.data.title}</DocsTitle>
          {(prevNav || nextNav) && (
            <div className="flex flex-row items-center gap-1.5 pt-0.5">
              <Link
                aria-disabled={!prevNav}
                aria-label={
                  prevNav ? `Go to ${prevNav.name}` : "No previous page"
                }
                className={
                  prevNav ? undefined : "pointer-events-none opacity-50"
                }
                href={prevNav?.url ?? page.url}
              >
                <Button size="icon-sm" variant="accent">
                  <ArrowLeft />
                </Button>
              </Link>
              <Link
                aria-disabled={!nextNav}
                aria-label={nextNav ? `Go to ${nextNav.name}` : "No next page"}
                className={
                  nextNav ? undefined : "pointer-events-none opacity-50"
                }
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
          <DocsAuthor
            name={page.data.author.name}
            url={page.data.author?.url}
          />
        )}

        <PageActionButtons
          githubUrl={`${GITHUB_REPO_URL}/blob/main/apps/www/content/icons/${page.path}`}
          key={page.url}
          markdownUrl={`${page.url}.mdx`}
          url={page.url}
        />

        <DocsBody className="pt-4 pb-10" id="docs-body">
          <MDXContent
            components={getMDXComponents({
              a: createRelativeLink(iconsSource, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </DocsBoneyardCapture>
  );
}

export async function generateStaticParams() {
  return iconsSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await props.params;

  const page = iconsSource.getPage(slug);
  if (!page) {
    return {};
  }

  const ogPath = ["icons", ...slug];
  const title = page.data.title;

  return {
    title,
    description: page.data.description,
    alternates: getPageAlternates(page.url),
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
      title,
      description: page.data.description,
      url: `${SITE_URL}${page.url}`,
      siteName: "Sora UI",
      images: getOgMetadataImages(ogPath, title),
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.data.description,
      images: getTwitterMetadataImages(ogPath),
    },
  };
}
