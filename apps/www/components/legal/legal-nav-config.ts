export const LEGAL_NAV_ITEMS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/docs/license", label: "Component License" },
] as const;

export type LegalNavHref = (typeof LEGAL_NAV_ITEMS)[number]["href"];
