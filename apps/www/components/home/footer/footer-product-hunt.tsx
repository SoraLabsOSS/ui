"use client";

import { useTheme } from "next-themes";

const PRODUCT_HUNT_POST_ID = "1185665";
const PRODUCT_HUNT_URL =
  "https://www.producthunt.com/products/sora-ui?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-sora-ui";

export function FooterProductHunt() {
  const { resolvedTheme } = useTheme();
  const badgeTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <a
      aria-label="Sora UI on Product Hunt"
      className="inline-block w-fit"
      href={PRODUCT_HUNT_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* biome-ignore lint/performance/noImgElement: external dynamically-themed SVG badge from Product Hunt's API — next/image can't optimize it without enabling dangerouslyAllowSVG site-wide */}
      <img
        alt="Sora UI - Production-ready Shadcn-powered UI component library | Product Hunt"
        className="h-auto w-[180px] sm:w-[200px] lg:w-[220px]"
        height={54}
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${PRODUCT_HUNT_POST_ID}&theme=${badgeTheme}`}
        width={250}
      />
    </a>
  );
}
