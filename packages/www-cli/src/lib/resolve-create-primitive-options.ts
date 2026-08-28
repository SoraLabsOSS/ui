import { cancel, confirm, intro, isCancel, select, text } from "@clack/prompts";
import { assertKebabCase, categoryLabel } from "./naming.js";
import {
  CATEGORY_SECTIONS,
  PRIMITIVE_CATEGORIES,
  type PrimitiveCategory,
} from "./paths.js";
import { isInteractiveTerminal, nonInteractiveHint } from "./terminal.js";

export interface CreatePrimitiveOptions {
  category?: string;
  name?: string;
  skipBuild?: boolean;
  withDemo?: boolean;
  yes?: boolean;
}

function isPrimitiveCategory(value: string): value is PrimitiveCategory {
  return (PRIMITIVE_CATEGORIES as readonly string[]).includes(value);
}

function assertCanPrompt(
  nameArg: string | undefined,
  options: CreatePrimitiveOptions,
  interactive: boolean
): void {
  const hasName = Boolean(nameArg?.trim());
  const hasCategory = Boolean(
    options.category && isPrimitiveCategory(options.category)
  );

  if (interactive || options.yes || (hasName && hasCategory)) {
    return;
  }

  throw new Error(
    nonInteractiveHint(
      "bun run create:primitive <name> --category=effects --yes"
    )
  );
}

async function resolveCategory(
  categoryOption: string | undefined,
  interactive: boolean
): Promise<PrimitiveCategory> {
  if (categoryOption && isPrimitiveCategory(categoryOption)) {
    return categoryOption;
  }

  if (!interactive) {
    throw new Error(
      `Missing --category. Use one of: ${PRIMITIVE_CATEGORIES.join(", ")}`
    );
  }

  const selected = await select({
    message: "Category",
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

async function resolveName(
  nameArg: string | undefined,
  interactive: boolean
): Promise<string> {
  const trimmed = nameArg?.trim();
  if (trimmed) {
    assertKebabCase(trimmed);
    return trimmed;
  }

  if (!interactive) {
    throw new Error("Missing <name> argument (kebab-case slug).");
  }

  const entered = await text({
    message: "Component name (kebab-case)",
    placeholder: "my-awesome-effect",
    validate(value) {
      if (!value.trim()) {
        return "Name is required.";
      }
      try {
        assertKebabCase(value.trim());
      } catch (error) {
        return error instanceof Error ? error.message : "Invalid name.";
      }
    },
  });
  if (isCancel(entered)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return entered.trim();
}

async function resolveWithDemo(
  withDemoOption: boolean | undefined,
  interactive: boolean,
  yes: boolean | undefined
): Promise<boolean> {
  if (withDemoOption !== undefined || yes) {
    return withDemoOption ?? false;
  }

  if (!interactive) {
    return false;
  }

  const demoChoice = await confirm({
    message: "Create manual demo folder?",
    initialValue: false,
  });
  if (isCancel(demoChoice)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return demoChoice;
}

export async function resolveCreatePrimitiveOptions(
  nameArg: string | undefined,
  options: CreatePrimitiveOptions
): Promise<{
  category: PrimitiveCategory;
  name: string;
  skipBuild: boolean;
  withDemo: boolean;
}> {
  const interactive = isInteractiveTerminal();
  assertCanPrompt(nameArg, options, interactive);

  intro(
    options.yes
      ? "www-cli · create primitive"
      : "www-cli · create motion primitive"
  );

  const category = await resolveCategory(options.category, interactive);
  const name = await resolveName(nameArg, interactive);
  const withDemo = await resolveWithDemo(
    options.withDemo,
    interactive,
    options.yes
  );

  return {
    category,
    name,
    withDemo,
    skipBuild: options.skipBuild ?? false,
  };
}
