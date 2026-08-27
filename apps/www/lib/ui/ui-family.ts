export const UI_FAMILY_LABEL = {
  base: "Base UI",
  radix: "Radix UI",
} as const;

export type UiFamily = keyof typeof UI_FAMILY_LABEL;

const UI_FAMILY_IN_URL = /(?:^|\/)ui\/(base|radix)(?:\/|$)/;

/** `base` / `radix` from a UI docs URL such as `/ui/base/button`. */
export function getUiFamily(url: string): UiFamily | undefined {
  const match = UI_FAMILY_IN_URL.exec(url);
  if (!match) {
    return;
  }

  return match[1] as UiFamily;
}

/** Sidebar section label for a UI family page, or `undefined` for overview routes. */
export function getUiFamilyLabel(url: string): string | undefined {
  const family = getUiFamily(url);
  return family ? UI_FAMILY_LABEL[family] : undefined;
}

/** Search / metadata title that distinguishes Base vs Radix twins. */
export function getUiQualifiedTitle(title: string, url: string): string {
  const label = getUiFamilyLabel(url);
  if (!label) {
    return title;
  }

  return `${title} · ${label}`;
}

/** Hint for search rows whose visible text does not already include the family. */
export function getUiSearchHint(
  url: string,
  content?: string
): string | undefined {
  const label = getUiFamilyLabel(url);
  if (!label) {
    return;
  }

  if (content?.includes(label)) {
    return;
  }

  return label;
}
