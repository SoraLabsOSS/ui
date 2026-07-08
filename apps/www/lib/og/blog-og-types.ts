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
