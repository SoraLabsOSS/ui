import { registryItemSchema, registrySchema } from "shadcn/schema";

function formatSchemaIssues(error: {
  issues: Array<{ message: string; path: PropertyKey[] }>;
}): string {
  return error.issues
    .map((issue) => {
      const issuePath =
        issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
      return `  - ${issuePath}: ${issue.message}`;
    })
    .join("\n");
}

/** Validate a single `registry-item.json` (source or published `public/r/*.json`). */
export function assertRegistryItem(value: unknown, source: string): void {
  const result = registryItemSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid registry item (${source}):\n${formatSchemaIssues(result.error)}`
    );
  }
}

/** Validate a merged `registry.json` catalog. */
export function assertRegistryCatalog(value: unknown, source: string): void {
  const result = registrySchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid registry catalog (${source}):\n${formatSchemaIssues(result.error)}`
    );
  }
}
