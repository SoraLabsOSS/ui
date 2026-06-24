export interface PageReleaseDateFields {
  lastModified?: Date | string | number;
  releaseDate?: Date | string;
}

export function toReleaseDateString(
  value: Date | string | number | undefined
): string | undefined {
  if (value === undefined) {
    return;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return;
  }

  return date.toISOString().slice(0, 10);
}

export function getPageReleaseDateString(
  data: PageReleaseDateFields
): string | undefined {
  return toReleaseDateString(data.releaseDate ?? data.lastModified);
}

export function getPageReleaseTimestamp(
  data: PageReleaseDateFields
): number | undefined {
  const value = data.releaseDate ?? data.lastModified;
  if (value === undefined) {
    return;
  }

  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? undefined : time;
}
