const NEW_RELEASE_WINDOW_DAYS = 10;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function isRecentlyReleased(date: Date | string | undefined): boolean {
  if (!date) {
    return false;
  }
  const release = typeof date === "string" ? new Date(date) : date;
  const releaseMs = release.getTime();
  if (Number.isNaN(releaseMs)) {
    return false;
  }

  const diffDays = (Date.now() - releaseMs) / MS_PER_DAY;
  return diffDays <= NEW_RELEASE_WINDOW_DAYS;
}

export function isPageNew(
  url: string | undefined,
  releaseDatesByUrl: Record<string, string>
): boolean {
  if (!url) {
    return false;
  }
  return isRecentlyReleased(releaseDatesByUrl[url]);
}
