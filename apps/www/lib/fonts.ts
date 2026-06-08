import localFont from "next/font/local";

export const sfProDisplay = localFont({
  src: [
    {
      path: "../public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYREGULAR.OTF",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYMEDIUM.OTF",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/sf-pro-display-cdnfonts/SFPRODISPLAYBOLD.OTF",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
});
