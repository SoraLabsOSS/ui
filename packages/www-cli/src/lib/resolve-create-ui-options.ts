import { cancel, confirm, intro, isCancel, select, text } from "@clack/prompts";
import { assertKebabCase, frameworkLabel } from "./naming.js";
import { UI_FRAMEWORKS, UI_SECTIONS, type UiFramework } from "./paths.js";
import {
  allowsPrompts,
  isScripted,
  type ScaffoldRunFlags,
} from "./scaffold-flags.js";
import { nonInteractiveHint } from "./terminal.js";

export interface CreateUiOptions extends ScaffoldRunFlags {
  framework?: string;
  name?: string;
  skipBuild?: boolean;
  skipDemo?: boolean;
  withDemo?: boolean;
}

function isUiFramework(value: string): value is UiFramework {
  return (UI_FRAMEWORKS as readonly string[]).includes(value);
}

function assertCanPrompt(
  nameArg: string | undefined,
  options: CreateUiOptions
): void {
  const hasName = Boolean(nameArg?.trim());
  const hasFramework = Boolean(
    options.framework && isUiFramework(options.framework)
  );

  if (
    allowsPrompts(options) ||
    isScripted(options) ||
    (hasName && hasFramework)
  ) {
    return;
  }

  throw new Error(
    nonInteractiveHint("bun run create:ui <name> --framework=base --yes")
  );
}

async function resolveFramework(
  frameworkOption: string | undefined,
  interactive: boolean
): Promise<UiFramework> {
  if (frameworkOption && isUiFramework(frameworkOption)) {
    return frameworkOption;
  }

  if (!interactive) {
    throw new Error(
      `Missing --framework. Use one of: ${UI_FRAMEWORKS.join(", ")}`
    );
  }

  const selected = await select({
    message: "Framework",
    options: UI_FRAMEWORKS.map((value) => ({
      value,
      label: frameworkLabel(value),
      hint: UI_SECTIONS[value],
    })),
  });
  if (isCancel(selected)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  if (!isUiFramework(selected)) {
    throw new Error(`Invalid framework "${String(selected)}".`);
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
    placeholder: "my-widget",
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

async function resolveWithDemo(options: CreateUiOptions): Promise<boolean> {
  if (options.skipDemo) {
    return false;
  }
  if (options.withDemo !== undefined) {
    return options.withDemo;
  }
  if (isScripted(options)) {
    return true;
  }

  if (!allowsPrompts(options)) {
    return true;
  }

  const demoChoice = await confirm({
    message: "Create manual demo folder?",
    initialValue: true,
  });
  if (isCancel(demoChoice)) {
    cancel("Cancelled.");
    process.exit(0);
  }
  return demoChoice;
}

export async function resolveCreateUiOptions(
  nameArg: string | undefined,
  options: CreateUiOptions
): Promise<{
  dryRun: boolean;
  framework: UiFramework;
  name: string;
  quiet: boolean;
  skipBuild: boolean;
  withDemo: boolean;
}> {
  assertCanPrompt(nameArg, options);
  const interactive = allowsPrompts(options);

  if (!(options.quiet || options.dryRun)) {
    intro(
      isScripted(options)
        ? "www-cli · create ui"
        : "www-cli · create UI component"
    );
  }

  const framework = await resolveFramework(options.framework, interactive);
  const name = await resolveName(nameArg, interactive);
  const withDemo = await resolveWithDemo(options);

  return {
    framework,
    name,
    withDemo,
    dryRun: options.dryRun ?? false,
    quiet: options.quiet ?? false,
    skipBuild: options.skipBuild ?? false,
  };
}
