import { cancel, intro, isCancel, select, text } from "@clack/prompts";
import { buildCatalogLabels } from "./catalog-templates.js";
import { assertKebabCase, categoryLabel } from "./naming.js";
import {
  CATEGORY_SECTIONS,
  PRIMITIVE_CATEGORIES,
  type PrimitiveCategory,
} from "./paths.js";
import {
  allowsPrompts,
  isScripted,
  type ScaffoldRunFlags,
} from "./scaffold-flags.js";
import { nonInteractiveHint } from "./terminal.js";

export interface CreateCatalogOptions extends ScaffoldRunFlags {
  category?: string;
  description?: string;
  registryName?: string;
  skipBuild?: boolean;
  slug?: string;
  title?: string;
}

export interface ResolvedCreateCatalogOptions {
  category: PrimitiveCategory;
  description: string;
  dryRun: boolean;
  quiet: boolean;
  registryName: string;
  skipBuild: boolean;
  slug: string;
  title: string;
}

function isPrimitiveCategory(value: string): value is PrimitiveCategory {
  return (PRIMITIVE_CATEGORIES as readonly string[]).includes(value);
}

function assertCanPrompt(
  slugArg: string | undefined,
  options: CreateCatalogOptions
): void {
  const hasSlug = Boolean(slugArg?.trim() || options.slug?.trim());

  if (allowsPrompts(options) || isScripted(options) || hasSlug) {
    return;
  }

  throw new Error(nonInteractiveHint("bun run create:catalog <slug> --yes"));
}

async function resolveCategory(
  categoryOption: string | undefined,
  interactive: boolean
): Promise<PrimitiveCategory> {
  if (categoryOption && isPrimitiveCategory(categoryOption)) {
    return categoryOption;
  }

  if (!interactive) {
    return "effects";
  }

  const selected = await select({
    message: "Primary primitive category",
    initialValue: "effects",
    options: PRIMITIVE_CATEGORIES.map((value) => ({
      value,
      label: categoryLabel(value),
      hint: CATEGORY_SECTIONS[value],
    })),
  });
  if (isCancel(selected)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  if (!isPrimitiveCategory(selected)) {
    throw new Error(`Invalid category "${String(selected)}".`);
  }
  return selected;
}

async function resolveSlug(
  slugArg: string | undefined,
  options: CreateCatalogOptions,
  interactive: boolean
): Promise<string> {
  const candidate = (slugArg ?? options.slug)?.trim();
  if (candidate) {
    assertKebabCase(candidate);
    return candidate;
  }

  if (!interactive) {
    throw new Error("Missing <slug> argument (kebab-case).");
  }

  const entered = await text({
    message: "Catalog slug (kebab-case)",
    placeholder: "hero-parallax-showcase",
    validate(value) {
      if (!value.trim()) {
        return "Slug is required.";
      }
      try {
        assertKebabCase(value.trim());
      } catch (error) {
        return error instanceof Error ? error.message : "Invalid slug.";
      }
    },
  });
  if (isCancel(entered)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return entered.trim();
}

async function resolveRegistryName(
  slug: string,
  registryNameOption: string | undefined,
  interactive: boolean
): Promise<string> {
  const candidate = registryNameOption?.trim();
  if (candidate) {
    assertKebabCase(candidate);
    return candidate;
  }

  if (!interactive) {
    return slug;
  }

  const entered = await text({
    message: "Underlying registry primitive name",
    initialValue: slug,
    placeholder: slug,
    validate(value) {
      if (!value.trim()) {
        return;
      }
      try {
        assertKebabCase(value.trim());
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "Invalid registry name.";
      }
    },
  });
  if (isCancel(entered)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return entered.trim() || slug;
}

export async function resolveCreateCatalogOptions(
  slugArg: string | undefined,
  options: CreateCatalogOptions = {}
): Promise<ResolvedCreateCatalogOptions> {
  assertCanPrompt(slugArg, options);

  const interactive = allowsPrompts(options);
  if (interactive && !options.quiet) {
    intro("www-cli · create catalog");
  }

  const slug = await resolveSlug(slugArg, options, interactive);
  const category = await resolveCategory(options.category, interactive);
  const registryName = await resolveRegistryName(
    slug,
    options.registryName,
    interactive
  );

  const labels = buildCatalogLabels(slug, registryName);

  return {
    slug,
    category,
    registryName,
    title: options.title?.trim() || labels.title,
    description: options.description?.trim() || labels.description,
    dryRun: Boolean(options.dryRun),
    quiet: Boolean(options.quiet),
    skipBuild: Boolean(options.skipBuild),
  };
}
