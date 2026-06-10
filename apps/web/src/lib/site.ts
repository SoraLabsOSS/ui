import { env } from "@/env";

/** Marketing site origin — metadata, sitemap, robots, and JSON-LD. */
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

/** Docs app origin (apps/www). */
export const DOCS_URL = env.NEXT_PUBLIC_DOCS_URL;

export const SITE_NAME = "Soralabs";

export const SITE_DESCRIPTION =
  "Building developer tools and open-source software.";

export const SITE_TITLE = `${SITE_NAME} — ${SITE_DESCRIPTION}`;
