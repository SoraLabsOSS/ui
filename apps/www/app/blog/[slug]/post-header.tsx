import Image from "next/image";
import Link from "next/link";
import { getBlogAuthorByName } from "@/lib/blog/blog-authors";
import { BlogPostActions } from "./blog-post-actions";

function formatPostDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AuthorAvatar({ author }: { author: string }) {
  const profile = getBlogAuthorByName(author);

  if (profile?.avatar) {
    return (
      <Image
        alt=""
        className="size-4 shrink-0 rounded-full ring-1 ring-border"
        draggable={false}
        height={16}
        src={profile.avatar}
        unoptimized
        width={16}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[10px] text-muted-foreground uppercase"
    >
      {author.slice(0, 1)}
    </span>
  );
}

export function BlogPostHeader({
  author,
  date,
  primaryTag,
  readingMinutes,
  title,
  url,
}: {
  author: string;
  date: Date;
  primaryTag?: string;
  readingMinutes: number | null;
  title: string;
  url: string;
}) {
  const profile = getBlogAuthorByName(author);
  const formattedDate = formatPostDate(date);

  return (
    <header className="not-prose mb-10 flex flex-col gap-5 lg:mb-14">
      <h1 className="text-pretty font-medium text-3xl tracking-tight lg:text-4xl lg:leading-tight">
        {title}
      </h1>

      <div className="order-first flex flex-col gap-2 text-muted-foreground text-sm">
        <span>
          <Link
            className="transition-colors hover:text-foreground"
            href="/blog"
          >
            Blog
          </Link>
          {primaryTag ? (
            <span className="before:mx-1 before:content-['/']">
              <span>{primaryTag}</span>
            </span>
          ) : null}
        </span>
      </div>

      <div className="order-last flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <AuthorAvatar author={author} />
          </div>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0 text-sm">
            <span className="font-medium text-foreground">{author}</span>
            {profile?.handle ? (
              <span className="text-muted-foreground">{profile.handle}</span>
            ) : null}
            <time
              className="text-muted-foreground"
              dateTime={date.toISOString()}
            >
              {formattedDate}
            </time>
            {readingMinutes === null ? null : (
              <span className="text-muted-foreground before:mr-2 before:content-['·']">
                {readingMinutes} min read
              </span>
            )}
          </span>
        </div>

        <BlogPostActions url={url} />
      </div>
    </header>
  );
}
