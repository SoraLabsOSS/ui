import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WorkFooter } from "@/components/work/work-footer";
import { formatPostDate, getAllPosts } from "@/lib/blog";

export async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="Blog" />
      <main className="mx-auto w-full max-w-[560px] flex-1 px-[28px] pt-[60px] pb-[48px] lg:pb-[90px]">
        {posts.length === 0 ? (
          <p className="text-[#555] text-[13px]">No posts yet.</p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post, index) => (
              <Link
                className="group flex animate-fade-in-up flex-col gap-1.5 border-[#1a1a1a] border-t py-6 no-underline first:border-t-0 first:pt-0"
                href={`/blog/${post.slug}`}
                key={post.slug}
                style={{ animationDelay: `${50 + index * 50}ms` }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-[15px] text-white transition-colors group-hover:text-[#999]">
                    {post.metadata.title}
                  </h2>
                  <time
                    className="shrink-0 text-[#555] text-[10px] uppercase tracking-[0.08em]"
                    dateTime={post.metadata.date}
                  >
                    {formatPostDate(post.metadata.date)}
                  </time>
                </div>
                <p className="text-[#999] text-[13px] leading-[1.7]">
                  {post.metadata.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <WorkFooter fixedOnDesktop />
    </div>
  );
}
