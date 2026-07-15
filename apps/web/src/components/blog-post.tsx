import Link from "next/link";
import { InlineToc } from "@/components/blog/inline-toc";
import { ShareButton } from "@/components/blog/share-button";
import { PageHeader } from "@/components/page-header";
import { WorkFooter } from "@/components/work/work-footer";
import type { BlogMetadata, BlogPostData } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";
import { useMDXComponents } from "@/mdx-components";

export function BlogPost({
  Content,
  metadata,
  slug,
  toc,
}: {
  Content: BlogPostData["default"];
  metadata: BlogMetadata;
  slug: string;
  toc: BlogPostData["toc"];
}) {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="Blog" />
      <main className="mx-auto w-full max-w-[640px] flex-1 px-[28px] pt-[60px] pb-[48px] lg:pb-[90px]">
        <div className="mb-8 flex animate-fade-in-up gap-8 text-[12px]">
          <div>
            <p className="mb-1 text-[#555] uppercase tracking-[0.08em]">
              Written by
            </p>
            <p className="text-white">{metadata.author ?? "Axyl"}</p>
          </div>
          <div>
            <p className="mb-1 text-[#555] uppercase tracking-[0.08em]">At</p>
            <time className="text-white" dateTime={metadata.date}>
              {formatPostDate(metadata.date)}
            </time>
          </div>
        </div>

        <div className="animate-fade-in-up [animation-delay:50ms]">
          <h1 className="text-[24px] text-white leading-[1.3]">
            {metadata.title}
          </h1>
          <p className="mt-3 text-[#999] text-[13px]">{metadata.description}</p>

          {metadata.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {metadata.tags.map((tag) => (
                <span
                  className="rounded-full border border-[#333] px-2.5 py-1 text-[#999] text-[10px] uppercase tracking-[0.04em]"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex animate-fade-in-up gap-2.5 [animation-delay:75ms]">
          <ShareButton url={`/blog/${slug}`} />
          <Link
            className="rounded-full border border-[#333] px-3.5 py-1.5 text-[10px] text-white uppercase tracking-[0.08em] no-underline transition-colors hover:border-[#555]"
            data-cursor-hover
            href="/blog"
          >
            Back
          </Link>
        </div>

        <article className="prose prose-invert mt-8 max-w-none animate-fade-in-up prose-headings:font-normal prose-a:text-white prose-code:text-[13px] prose-p:text-[#ccc] text-[13px] [animation-delay:100ms]">
          <InlineToc items={toc} />
          <Content components={useMDXComponents({})} />
        </article>
      </main>
      <WorkFooter fixedOnDesktop />
    </div>
  );
}
