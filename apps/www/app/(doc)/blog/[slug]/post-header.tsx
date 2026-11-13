import Image from "next/image";
import Link from "next/link";

import { PageActionButtons } from "@/components/docs/page-actions";
import { getBlogAuthorByName } from "@/lib/blog/blog-authors";

function AuthorAvatar({ author }: { author: string }) {
  const profile = getBlogAuthorByName(author);

  if (profile?.avatar) {
    return (
      <Image
        alt=""
        className="ring-border size-5 shrink-0 rounded-full ring-1"
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
      className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium uppercase"
    >
      {author.slice(0, 1)}
    </span>
  );
}

export function BlogPostHeader({
  author,
  description,
  githubUrl,
  primaryTag,
  title,
  url,
}: {
  author: string;
  date?: Date;
  description?: string;
  githubUrl?: string;
  primaryTag?: string;
  readingMinutes?: number | null;
  title: string;
  url?: string;
}) {
  const profile = getBlogAuthorByName(author);

  return (
    <header className="col-span-12 mb-12 flex w-full flex-col gap-5 max-xl:mx-auto max-xl:max-w-3xl xl:col-span-6 xl:col-start-4 xl:mb-16">
      <div className="text-muted-foreground order-first flex items-center text-sm">
        <span>
          <Link
            className="hover:text-foreground cursor-pointer transition-colors"
            href="/blog"
          >
            Blog
          </Link>
        </span>
        {primaryTag ? (
          <span className="before:mx-1 before:content-['/']">
            <Link
              className="hover:text-foreground cursor-pointer transition-colors"
              href={`/blog?tag=${primaryTag}`}
            >
              {primaryTag}
            </Link>
          </span>
        ) : null}
      </div>

      <h1 className="text-foreground text-3xl leading-tight font-[450] tracking-tight text-balance text-pretty sm:text-4xl xl:text-5xl">
        {title}
      </h1>

      {description ? (
        <p className="text-muted-foreground text-base leading-relaxed text-pretty sm:text-lg">
          {description}
        </p>
      ) : null}

      <div className="order-last flex flex-col gap-5">
        <div className="flex gap-2">
          <div
            className="text-foreground flex items-center gap-x-2 gap-y-1"
            id="authors"
          >
            <div className="mt-0.5">
              <AuthorAvatar author={author} />
            </div>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0 text-sm">
              <span className="text-foreground font-medium">{author}</span>
              {profile?.handle ? (
                <span className="text-muted-foreground">{profile.handle}</span>
              ) : null}
            </span>
          </div>
        </div>

        {url ? (
          <PageActionButtons
            githubUrl={githubUrl}
            key={url}
            markdownUrl={`${url}.mdx`}
            url={url}
          />
        ) : null}
      </div>
    </header>
  );
}
