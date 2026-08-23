import { getReleaseDatesByUrl } from "@/lib/docs/get-release-dates-by-url";

/** URL → date for the 10-day "new" sidebar badge on `/ui` pages. */
export function getUiReleaseDatesByUrl(): Record<string, string> {
  return getReleaseDatesByUrl();
}
