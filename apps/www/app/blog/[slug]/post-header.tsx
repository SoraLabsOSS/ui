import Image from "next/image";
import Link from "next/link";
import { getBlogAuthorByName } from "@/lib/blog/blog-authors";

function AuthorAvatar({ author }: { author: string }) {
  const profile = getBlogAuthorByName(author);

  if (profile?.avatar) {
    return (
      <Image
        alt=""
        className="size-5 shrink-0 rounded-full ring-1 ring-border"
        draggable={false}
        height={20}
        src={profile.avatar}
        unoptimized
        width={20}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[10px] text-muted-foreground uppercase"
    >
      {author.slice(0, 1)}
    </span>
  );
}

export function BlogPostHeader({
  author,
  description,
  primaryTag,
  title,
}: {
  author: string;
  date?: Date;
  description?: string;
  primaryTag?: string;
  readingMinutes?: number | null;
  title: string;
  url?: string;
}) {
  const profile = getBlogAuthorByName(author);

  return (
    <header className="@lg:col-span-7 @xl:col-span-6 col-span-12 @lg:col-start-2 @xl:col-start-4 @lg:mb-16 mb-12 flex flex-col gap-5">
      <div className="order-first flex items-center text-muted-foreground text-sm">
        <span>
          <Link
            className="cursor-pointer transition-colors hover:text-foreground"
            href="/blog"
          >
            Blog
          </Link>
        </span>
        {primaryTag ? (
          <span className="before:mx-1 before:content-['/']">
            <Link
              className="cursor-pointer transition-colors hover:text-foreground"
              href={`/blog?tag=${primaryTag}`}
            >
              {primaryTag}
            </Link>
          </span>
        ) : null}
      </div>

      <h1 className="text-balance text-pretty font-[450] @lg:text-5xl text-3xl text-foreground leading-tight tracking-tight sm:text-4xl">
        {title}
      </h1>

      {description ? (
        <p className="text-pretty @lg:text-lg text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      ) : null}

      <div className="order-last flex flex-col gap-5">
        <div className="flex gap-2">
          <div
            className="flex items-center gap-x-2 gap-y-1 text-foreground"
            id="authors"
          >
            <div className="mt-0.5">
              <AuthorAvatar author={author} />
            </div>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0 text-sm">
              <span className="font-medium text-foreground">{author}</span>
              {profile?.handle ? (
                <span className="text-muted-foreground">{profile.handle}</span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
