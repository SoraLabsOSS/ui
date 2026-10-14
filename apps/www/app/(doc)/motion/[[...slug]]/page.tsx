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
import { connection } from "next/server";
import { DocsAuthor } from "@/components/docs/docs-author";
import { DocsHeaderToc } from "@/components/docs/docs-header-toc";
import { DocsPageJsonLd } from "@/components/docs/docs-page-json-ld";
import type { DocsPagerItem } from "@/components/docs/docs-pager";
import { DocsPager } from "@/components/docs/docs-pager";
import { Footer } from "@/components/docs/footer";
import { PageActionButtons } from "@/components/docs/page-actions";
import { motionSource } from "@/lib/motion/source";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { GITHUB_REPO_URL, getPageAlternates, SITE_URL } from "@/lib/site";
import { getMDXComponents } from "@/mdx-components";

const resolveNavItem = (url: string, fallbackName: string): DocsPagerItem => {
  const pageData = motionSource.getPageByHref(url)?.page;
  return {
    description: pageData?.data.description,
    name: pageData?.data.title ?? fallbackName,
    url,
  };
};

export default async function MotionPage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  if (!motionSource.getPage(params.slug)) {
    await connection();
    notFound();
  }

  return <MotionPageBody slug={params.slug} />;
}

async function MotionPageBody({ slug }: { slug?: string[] }) {
  const page = motionSource.getPage(slug);
  if (!page) {
    return null;
  }

  const MDXContent = page.data.body;
  const tree = motionSource.getPageTree();
  const { previous, next: nextPage } = findNeighbour(tree, page.url);

  const prevNav: DocsPagerItem | undefined = (() => {
    if (previous?.url?.startsWith("/motion")) {
      return resolveNavItem(previous.url, String(previous.name ?? "Previous"));
    }
    return;
  })();

  const nextNav: DocsPagerItem | undefined = (() => {
    if (nextPage?.url?.startsWith("/motion")) {
      return resolveNavItem(nextPage.url, String(nextPage.name ?? "Next"));
    }
    return;
  })();

  return (
    <DocsPage
      article={{
        className: "[&>[role=none].flex-1]:hidden",
      }}
      footer={{
        component: (
          <div className="flex w-full flex-col gap-6">
            <DocsPager next={nextNav} previous={prevNav} />
            <Footer
              lastUpdate={
                page.data.lastModified
                  ? new Date(page.data.lastModified)
                  : undefined
              }
            />
          </div>
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
              className={prevNav ? undefined : "pointer-events-none opacity-50"}
              href={prevNav?.url ?? page.url}
            >
              <Button size="icon-sm" variant="accent">
                <ArrowLeft />
              </Button>
            </Link>
            <Link
              aria-disabled={!nextNav}
              aria-label={nextNav ? `Go to ${nextNav.name}` : "No next page"}
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
        githubUrl={`${GITHUB_REPO_URL}/blob/main/apps/www/content/motion/${page.path}`}
        key={page.url}
        markdownUrl={`${page.url}.mdx`}
        url={page.url}
      />

      <DocsBody className="pt-4 pb-10" id="docs-body">
        <MDXContent
          components={getMDXComponents({
            a: createRelativeLink(motionSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return motionSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await props.params;

  const page = motionSource.getPage(slug);
  if (!page) {
    return {};
  }

  const ogPath = ["motion", ...slug];
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
