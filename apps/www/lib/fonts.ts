import localFont from "next/font/local";

/**
 * Primary site font — SF Pro Display (Apple / Vercel style).
 * Used across the entire site (marketing, docs, components, playground).
 */
export const fontSfPro = localFont({
  src: [
    {
      path: "../public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYREGULAR.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYMEDIUM.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYBOLD.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

/**
 * Expressive handwriting accent font — Brisa Pro.
 * Used exclusively for playful cursive scribble annotations on marketing / hero sections.
 */
export const fontBrisaPro = localFont({
  src: "../public/fonts/brisa/BrisaPro-Regular.woff2",
  variable: "--font-brisa-pro",
  display: "swap",
  weight: "400",
  style: "normal",
  fallback: ["cursive", "sans-serif"],
});
