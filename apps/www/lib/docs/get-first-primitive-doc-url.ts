import { motionSource } from "@/lib/motion/source";

/** Motion landing page when present, else "/motion". Server-only. */
export function getFirstPrimitiveDocUrl(): string {
  const landingPage = motionSource.getPage([]);
  if (landingPage) {
    return landingPage.url;
  }

  return "/motion";
}
