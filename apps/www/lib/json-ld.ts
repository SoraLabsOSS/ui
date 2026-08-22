import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const SORA_UI_PUBLISHER_JSON_LD = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Sora UI",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/android-chrome-192x192.png`,
  },
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
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sora UI",
      url: SITE_URL,
      email: CONTACT_EMAIL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/android-chrome-192x192.png`,
        width: 192,
        height: 192,
      },
    },
  ],
};
