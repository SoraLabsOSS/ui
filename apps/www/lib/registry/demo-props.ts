export function unwrapValues(
  value: Record<string, unknown>
): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    if ("value" in value) {
      return value.value as Record<string, unknown>;
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        nestedValue && typeof nestedValue === "object"
          ? unwrapValues(nestedValue as Record<string, unknown>)
          : nestedValue,
      ])
    );
  }

  return value;
}

export function flattenFirstLevel<T>(input: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const current of Object.values(input)) {
    if (typeof current === "object" && current !== null) {
      Object.assign(result, current);
    }
  }
  return result as T;
}
