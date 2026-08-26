import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const SORA_UI_PUBLISHER_JSON_LD = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Sora UI",
  alternateName: "Sora Labs",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/android-chrome-192x192.png`,
    caption: "Sora UI Logo",
    width: 192,
    height: 192,
  },
  sameAs: ["https://github.com/SoraLabsOSS/ui"],
  slogan: "Motion-first for React",
  knowsAbout: [
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Motion",
    "GSAP",
    "Animated UI components",
    "UI library",
    "shadcn/ui",
  ],
  founder: {
    "@type": "Person",
    name: "Axyl",
    jobTitle: "Founder",
    sameAs: ["https://github.com/axyl1410", "https://x.com/axyl1410"],
  },
  foundingDate: "2026-08-24",
} as const;

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sora UI",
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    SORA_UI_PUBLISHER_JSON_LD,
  ],
};
