import { DOCS_URL, GITHUB_URL, TWITTER_URL } from "@/lib/site";

/** Sora UI accent — matches apps/www `--accent-pro`. */
export const BRAND_ACCENT = "#fb460d";

/** ASCII hand glyph — brand orange, softened on dark bg. */
export const BRAND_ASCII_CHAR = "rgba(253, 85, 29, 0.68)";

export const BRAND_TAGLINE =
  "From ideas to interfaces. We build polished digital products and reusable UI systems for developers. Sora UI — animated React components and a shadcn/ui registry.";

export interface BrandNavLink {
  external?: boolean;
  href: string;
  label: string;
}

export const BRAND_NAV_LINKS: BrandNavLink[] = [
  { href: DOCS_URL, label: "Sora UI", external: true },
  // { href: "#", label: "About" },
  { href: GITHUB_URL, label: "GitHub", external: true },
  { href: TWITTER_URL, label: "Contact", external: true },
];
