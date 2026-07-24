import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WorkFooter } from "@/components/work/work-footer";
import { formatPostDate, getAllPosts } from "@/lib/blog";

export async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="Blog" />
      <main className="flex-1 p-3.5">
        <div className="mb-3.5 flex animate-fade-in-up flex-col justify-end border border-[#1a1a1a] bg-[#0a0a0a] p-8 sm:aspect-[3.2] sm:p-12">
          <h1 className="font-normal text-2xl text-white sm:text-3xl">Blog</h1>
          <p className="mt-2 text-[#999] text-[13px]">
            Notes on this site, its stack, and what changes.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="px-1 text-[#555] text-[13px]">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                className="group flex animate-fade-in-up flex-col border border-[#1a1a1a] p-5 no-underline transition-colors hover:border-[#333] hover:bg-[#0a0a0a]"
                href={`/blog/${post.slug}`}
                key={post.slug}
                style={{ animationDelay: `${50 + index * 50}ms` }}
              >
                <h2 className="text-[14px] text-white">
                  {post.metadata.title}
                </h2>
                <p className="mt-1.5 line-clamp-4 text-[#999] text-[12px] leading-[1.7]">
                  {post.metadata.description}
                </p>
                <time
                  className="mt-auto pt-4 text-[10px] text-accent-brand uppercase tracking-[0.08em]"
                  dateTime={post.metadata.date}
                >
                  {formatPostDate(post.metadata.date)}
                </time>
              </Link>
            ))}
          </div>
        )}
      </main>
      <WorkFooter />
    </div>
  );
}
