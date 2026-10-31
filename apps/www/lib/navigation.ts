import {
  COMMUNITY_ISSUES_URL,
  COMMUNITY_REPO_URL,
  CONTACT_EMAIL,
  GITHUB_REPO_URL,
  STUDIO_URL,
  X_PROFILE_URL,
} from "./site";

export interface NavItem {
  external?: boolean;
  href: string;
  label: string;
}

export interface NavSocialItem {
  href: string;
  label: string;
  shape?: "round" | "square" | "";
  type: "github" | "x" | "community";
}

export interface FooterColumn {
  id: string;
  links: NavItem[];
  title: string;
}

export interface FooterLegalLink extends NavItem {
  shape: "round" | "square";
}

export interface FooterCreatorLink extends NavItem {
  shape?: "round" | "";
}

/**
 * Main navigation products dropdown items
 */
export const NAV_PRODUCTS = {
  main: [
    { label: "Motion Primitives", href: "/motion" },
    { label: "UI Foundation", href: "/ui" },
    { label: "Catalog Showcase", href: "/catalog" },
    { label: "Animated Icons", href: "/icons" },
    { label: "Sora CLI", href: "/docs/cli" },
  ] satisfies NavItem[],
  sub: [
    { label: "Base UI Components", href: "/ui" },
    { label: "Radix UI Components", href: "/ui" },
  ] satisfies NavItem[],
};

/**
 * Main navigation explore column items
 */
export const NAV_EXPLORE: NavItem[] = [
  { label: "Documentation", href: "/docs" },
  { label: "Catalog Layouts", href: "/catalog" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

/**
 * Social media links displayed in navigation drawer
 */
export const NAV_SOCIALS: NavSocialItem[] = [
  { label: "GitHub", href: GITHUB_REPO_URL, type: "github", shape: "round" },
  { label: "X", href: X_PROFILE_URL, type: "x", shape: "" },
  {
    label: "Community",
    href: COMMUNITY_REPO_URL,
    type: "community",
    shape: "round",
  },
];

/**
 * Footer link columns
 */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "components",
    title: "Components",
    links: [
      { label: "Motion Primitives", href: "/motion" },
      { label: "UI Foundation", href: "/ui" },
      { label: "Catalog Showcase", href: "/catalog" },
      { label: "Animated Icons", href: "/icons" },
      { label: "Sora CLI", href: "/docs/cli" },
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Base UI & Radix", href: "/ui" },
      { label: "Changelog", href: "/docs/changelog" },
      { label: "Troubleshooting", href: "/docs/installation#troubleshooting" },
    ],
  },
  {
    id: "community",
    title: "Community",
    links: [
      { label: "GitHub", href: GITHUB_REPO_URL, external: true },
      { label: "Community Hub", href: COMMUNITY_REPO_URL, external: true },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/pricing" },
      { label: "Report an Issue", href: COMMUNITY_ISSUES_URL, external: true },
      { label: "Support", href: `mailto:${CONTACT_EMAIL}`, external: true },
    ],
  },
];

/**
 * Footer bottom legal pills
 */
export const FOOTER_LEGAL_LINKS: FooterLegalLink[] = [
  {
    label: "License",
    href: "https://github.com/SoraLabsOSS/ui/blob/main/LICENSE",
    external: true,
    shape: "square",
  },
  {
    label: "Terms",
    href: "/legal/terms",
    shape: "round",
  },
  {
    label: "Privacy",
    href: "/legal/privacy",
    shape: "square",
  },
  {
    label: "Hub",
    href: COMMUNITY_REPO_URL,
    external: true,
    shape: "round",
  },
];

/**
 * Footer creators attribution
 */
export const FOOTER_CREATORS: FooterCreatorLink[] = [
  {
    label: "sora",
    href: "https://github.com/SoraLabsOSS",
    external: true,
    shape: "",
  },
  {
    label: "labs",
    href: STUDIO_URL,
    external: true,
    shape: "round",
  },
];
