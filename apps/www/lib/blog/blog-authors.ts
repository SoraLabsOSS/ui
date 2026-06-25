/** Sora UI logo used on `/blog` OG images (`public/android-chrome-512x512.png`). */
export const BLOG_BRAND_AVATAR_PATH = "/android-chrome-512x512.png";

export const BLOG_AUTHORS = {
  axyl: {
    avatar:
      "https://avatars.githubusercontent.com/u/142161991?s=400&u=dd40d6056600c4e7da605a618cfecea2f7c3da76&v=4",
    handle: "@axyl1410",
    name: "Axyl",
  },
} as const;

export type BlogAuthorId = keyof typeof BLOG_AUTHORS;
