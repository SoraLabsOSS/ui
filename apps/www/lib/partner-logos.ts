import type { LogoCarouselSwapperRow } from "@/registry/primitives/effects/logo-carousel-swapper";

export interface PartnerLogo {
  alt: string;
  src: string;
}

const PARTNER_LOGO_BASE_URL = "https://cdn.soralabs.studio/logos/partners";

export const PARTNER_LOGOS = {
  nvidia: {
    src: `${PARTNER_LOGO_BASE_URL}/nvidia-wordmark.svg`,
    alt: "Nvidia",
  },
  supabase: {
    src: `${PARTNER_LOGO_BASE_URL}/supabase-wordmark.svg`,
    alt: "Supabase",
  },
  github: {
    src: `${PARTNER_LOGO_BASE_URL}/github-wordmark.svg`,
    alt: "GitHub",
  },
  openai: {
    src: `${PARTNER_LOGO_BASE_URL}/openai-wordmark.svg`,
    alt: "OpenAI",
  },
  turso: {
    src: `${PARTNER_LOGO_BASE_URL}/turso-wordmark.svg`,
    alt: "Turso",
  },
  clerk: {
    src: `${PARTNER_LOGO_BASE_URL}/clerk-wordmark.svg`,
    alt: "Clerk",
  },
  claude: {
    src: `${PARTNER_LOGO_BASE_URL}/claude-wordmark.svg`,
    alt: "Claude",
  },
  vercel: {
    src: `${PARTNER_LOGO_BASE_URL}/vercel-wordmark.svg`,
    alt: "Vercel",
  },
} as const satisfies Record<string, PartnerLogo>;

/** Demo rows for LogoCarouselSwapper — each row has 4 unique logos. */
export const PARTNER_LOGO_CAROUSEL_ROWS: LogoCarouselSwapperRow[] = [
  [
    PARTNER_LOGOS.nvidia,
    PARTNER_LOGOS.supabase,
    PARTNER_LOGOS.github,
    PARTNER_LOGOS.openai,
  ],
  [
    PARTNER_LOGOS.turso,
    PARTNER_LOGOS.clerk,
    PARTNER_LOGOS.claude,
    PARTNER_LOGOS.vercel,
  ],
  [
    PARTNER_LOGOS.github,
    PARTNER_LOGOS.openai,
    PARTNER_LOGOS.turso,
    PARTNER_LOGOS.clerk,
  ],
  [
    PARTNER_LOGOS.nvidia,
    PARTNER_LOGOS.vercel,
    PARTNER_LOGOS.supabase,
    PARTNER_LOGOS.claude,
  ],
];
