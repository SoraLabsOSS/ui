import { PageHeader } from "@/components/page-header";
import { WorkFooter } from "@/components/work/work-footer";
import type { BlogMetadata, BlogPostModule } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";
import { useMDXComponents } from "@/mdx-components";

export function BlogPost({
  Content,
  metadata,
}: {
  Content: BlogPostModule["default"];
  metadata: BlogMetadata;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="Blog" />
      <main className="mx-auto w-full max-w-[640px] flex-1 px-[28px] pt-[60px] pb-[48px] lg:pb-[90px]">
        <div className="animate-fade-in-up [animation-delay:50ms]">
          <time
            className="text-[#555] text-[10px] uppercase tracking-[0.08em]"
            dateTime={metadata.date}
          >
            {formatPostDate(metadata.date)}
          </time>
          <h1 className="mt-2 text-[24px] text-white leading-[1.3]">
            {metadata.title}
          </h1>
          {metadata.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
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
        <article className="prose prose-invert mt-8 max-w-none animate-fade-in-up prose-headings:font-normal prose-a:text-white prose-code:text-[13px] prose-p:text-[#ccc] text-[13px] [animation-delay:100ms]">
          <Content components={useMDXComponents({})} />
        </article>
      </main>
      <WorkFooter fixedOnDesktop />
    </div>
  );
}
