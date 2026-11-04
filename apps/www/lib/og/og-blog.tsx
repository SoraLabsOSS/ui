import { readFile } from "node:fs/promises";
import path from "node:path";
import { BlogPostCard } from "@workspace/ui/components/og/blog-post-card";
import { ImageResponse } from "next/og";
import {
  BLOG_AUTHORS,
  BLOG_BRAND_AVATAR_PATH,
  type BlogAuthorId,
} from "@/lib/blog/blog-authors";
import { createBlogPostOgContent } from "@/lib/blog/create-blog-post-og-content";
import { getBlogIndexOgContent } from "@/lib/blog/get-blog-index-og-content";
import { blog } from "@/lib/blog/source";
import { staticContentCacheLife } from "@/lib/cache-life";
import { getOgSfProDisplayFontData, OG_FONT_FAMILY } from "@/lib/og/og-shared";
import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

/** OG card content for `/blog` and `/blog/[slug]` preview images. */
export interface BlogOgContent {
  author: string;
  avatar?: string;
  description?: string;
  /** Render description under title even when the title is long (blog index). */
  forceSubtitle?: boolean;
  handle: string;
  quote: string;
}

/** Show a one-line hook when the headline alone would leave the OG card sparse. */
export const BLOG_OG_SUBTITLE_TITLE_THRESHOLD = 50;

/**
 * Resolve the optional subtitle line for blog OG images.
 * Short titles get a one-line hook; long titles stay headline-only.
 */
export function resolveBlogOgSubtitle(
  title: string,
  description: string | undefined,
  forceSubtitle = false
): string | undefined {
  if (!description?.trim()) {
    return;
  }

  if (
    !forceSubtitle &&
    title.trim().length >= BLOG_OG_SUBTITLE_TITLE_THRESHOLD
  ) {
    return;
  }

  return description;
}

export const BLOG_OG_QUOTE_MAX_LENGTH = 200;
/** One-line hook under short titles on OG images (wraps to ~2 lines). */
export const BLOG_OG_SUBTITLE_MAX_LENGTH = 130;
export const BLOG_OG_AUTHOR_MAX_LENGTH = 80;
export const BLOG_OG_HANDLE_MAX_LENGTH = 64;

export const BLOG_POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function trimToMaxLength(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

/**
 * Trim OG subtitles at a natural boundary — never append "...".
 * Ellipsis mid-line reads cheap on a premium OG card.
 */
function trimBlogOgSubtitle(value: string, maxLength: number): string {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  for (const separator of [" — ", "—"]) {
    const dashIndex = trimmed.lastIndexOf(separator, maxLength);

    if (dashIndex >= maxLength * 0.45) {
      return trimmed.slice(0, dashIndex).trimEnd();
    }
  }

  let truncated = trimmed.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.55) {
    truncated = truncated.slice(0, lastSpace);
  }

  return truncated.trimEnd();
}

export function sanitizeBlogOgContent(content: BlogOgContent): BlogOgContent {
  return {
    quote: trimToMaxLength(content.quote, BLOG_OG_QUOTE_MAX_LENGTH),
    description: content.description
      ? trimBlogOgSubtitle(content.description, BLOG_OG_SUBTITLE_MAX_LENGTH)
      : undefined,
    forceSubtitle: content.forceSubtitle,
    author: trimToMaxLength(content.author, BLOG_OG_AUTHOR_MAX_LENGTH),
    handle: trimToMaxLength(content.handle, BLOG_OG_HANDLE_MAX_LENGTH),
    avatar: content.avatar,
  };
}

export function isValidBlogPostSlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= 120 && BLOG_POST_SLUG_PATTERN.test(slug)
  );
}

const ALLOWED_OG_IMAGE_HOSTS = new Set([
  "avatars.githubusercontent.com",
  "ui.soralabs.studio",
  "ui.soralabs.io.vn",
]);

function isAllowedOgImageHost(hostname: string): boolean {
  if (ALLOWED_OG_IMAGE_HOSTS.has(hostname)) {
    return true;
  }

  const allowedHosts = new Set<string>();

  for (const origin of [SITE_URL, getMetadataBaseUrl()]) {
    try {
      allowedHosts.add(new URL(origin).hostname);
    } catch {
      // Ignore invalid origins.
    }
  }

  return allowedHosts.has(hostname);
}

/** Reject non-HTTPS or untrusted hosts before Satori fetches an OG avatar. */
export function assertSafeOgImageUrl(src: string): string {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    throw new Error("Invalid OG image URL");
  }

  if (url.protocol !== "https:") {
    throw new Error("OG image URL must use HTTPS");
  }

  if (url.username || url.password) {
    throw new Error("OG image URL must not include credentials");
  }

  if (!isAllowedOgImageHost(url.hostname)) {
    throw new Error("OG image host is not allowed");
  }

  return url.toString();
}

const brandAvatarFileName = BLOG_BRAND_AVATAR_PATH.replace(/^\//, "");
const remoteDataUrls = new Map<string, Promise<string | undefined>>();

let brandAvatarDataUrl: Promise<string | undefined> | undefined;

function sniffImageMime(buffer: Buffer): "image/png" | "image/jpeg" | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }

  return null;
}

/** Palette PNGs (`color type 3`) make `next/og` throw "unsupported image format". */
function isIndexedPng(buffer: Buffer): boolean {
  return (
    sniffImageMime(buffer) === "image/png" &&
    buffer.length > 25 &&
    buffer[25] === 3
  );
}

function toOgDataUrl(buffer: Buffer): string | undefined {
  if (isIndexedPng(buffer)) {
    return;
  }

  const mime = sniffImageMime(buffer);
  if (!mime) {
    return;
  }

  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function getBrandAvatarDataUrl(): Promise<string | undefined> {
  if (!brandAvatarDataUrl) {
    brandAvatarDataUrl = readFile(
      path.join(process.cwd(), "public", brandAvatarFileName)
    )
      .then((buffer) => toOgDataUrl(buffer))
      .catch(() => undefined);
  }

  return brandAvatarDataUrl;
}

function isLocalBrandAvatar(src: string): boolean {
  const brandPaths = [
    BLOG_BRAND_AVATAR_PATH,
    `${SITE_URL}${BLOG_BRAND_AVATAR_PATH}`,
    `${getMetadataBaseUrl()}${BLOG_BRAND_AVATAR_PATH}`,
  ];

  return brandPaths.includes(src);
}

function fetchRemoteOgImage(src: string): Promise<string | undefined> {
  let url: string;
  try {
    url = assertSafeOgImageUrl(src);
  } catch {
    return Promise.resolve(undefined);
  }

  const cached = remoteDataUrls.get(url);
  if (cached) {
    return cached;
  }

  const pending = fetch(url, {
    headers: {
      Accept: "image/jpeg,image/png,image/*;q=0.8",
      "User-Agent": "SoraUI-OG/1.0",
    },
  })
    .then(async (response): Promise<string | undefined> => {
      if (!response.ok) {
        remoteDataUrls.delete(url);
        return;
      }

      const dataUrl = toOgDataUrl(Buffer.from(await response.arrayBuffer()));
      if (!dataUrl) {
        remoteDataUrls.delete(url);
      }
      return dataUrl;
    })
    .catch((): undefined => {
      remoteDataUrls.delete(url);
      return;
    });

  remoteDataUrls.set(url, pending);
  return pending;
}

/**
 * Satori cannot reliably fetch images itself (localhost, GitHub UA, palette PNG).
 * Always hand `next/og` a JPEG/PNG data URL, or omit the logo.
 */
export async function resolveOgImageSrc(
  src?: string
): Promise<string | undefined> {
  if (!src) {
    return;
  }

  if (isLocalBrandAvatar(src)) {
    return await getBrandAvatarDataUrl();
  }

  return await fetchRemoteOgImage(src);
}

function getAuthorIdFromName(name: string): BlogAuthorId {
  const authorId = Object.entries(BLOG_AUTHORS).find(
    ([, author]) => author.name.toLowerCase() === name.toLowerCase()
  )?.[0];

  return (authorId ?? "axyl") as BlogAuthorId;
}

/**
 * Per-post OG content keyed by blog slug (`/blog/[slug]`).
 * Built from frontmatter so new posts get `/blog-og/[slug]/image.png` automatically.
 */
export const blogOgPostsBySlug: Record<string, BlogOgContent> =
  Object.fromEntries(
    blog.getPages().flatMap((page) => {
      const slug = page.slugs[0];
      if (!slug) {
        return [];
      }

      return [
        [
          slug,
          createBlogPostOgContent(
            page.data.title,
            getAuthorIdFromName(page.data.author ?? "Axyl"),
            page.data.description,
            page.data.ogSubtitle
          ),
        ],
      ];
    })
  );

/**
 * Resolve quote-card content for `/blog-og/.../image.png`.
 * `pageSlug` is the path segments before `image.png`.
 */
export function resolveBlogOgContent(pageSlug: string[]): BlogOgContent | null {
  if (pageSlug.length === 0) {
    return sanitizeBlogOgContent(getBlogIndexOgContent());
  }

  if (pageSlug.length === 1) {
    const slug = pageSlug[0];

    if (!isValidBlogPostSlug(slug)) {
      return null;
    }

    const content = blogOgPostsBySlug[slug];
    if (!content) {
      return null;
    }

    return sanitizeBlogOgContent(content);
  }

  return null;
}

const BLOG_OG_GHOST = "Sora - UI";
const BLOG_OG_CREDIT = "Developed By @axyl1410";

function toRegistryProps(content: BlogOgContent, logo: string | undefined) {
  return {
    title: content.quote,
    description: resolveBlogOgSubtitle(
      content.quote,
      content.description,
      content.forceSubtitle
    ),
    credit: BLOG_OG_CREDIT,
    ghost: BLOG_OG_GHOST,
    logo: logo ?? "",
  };
}

export async function createBlogOgImageResponse(
  content: BlogOgContent
): Promise<ImageResponse> {
  const logo = await resolveOgImageSrc(content.avatar);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontFamily: OG_FONT_FAMILY,
        height: "100%",
        width: "100%",
      }}
    >
      <BlogPostCard {...toRegistryProps(content, logo)} />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: OG_FONT_FAMILY,
          data: await getOgSfProDisplayFontData(),
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}

export async function getBlogOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  const content = resolveBlogOgContent(pageSlug);
  if (!content) {
    return null;
  }

  try {
    return await (await createBlogOgImageResponse(content)).arrayBuffer();
  } catch {
    return await (
      await createBlogOgImageResponse({ ...content, avatar: undefined })
    ).arrayBuffer();
  }
}

export async function getCachedBlogOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  "use cache";
  staticContentCacheLife();
  return await getBlogOgImageBuffer(pageSlug);
}
