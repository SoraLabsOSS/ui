#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { runCreateCatalog } from "./commands/create-catalog.js";
import { runCreateIcon } from "./commands/create-icon.js";
import { runCreatePrimitive } from "./commands/create-primitive.js";
import { runCreateUi } from "./commands/create-ui.js";
import { runCreateWizard } from "./commands/create-wizard.js";
import { runDoctor } from "./commands/doctor.js";
import {
  CATALOG_HELP_AFTER,
  CREATE_HELP_AFTER,
  ICON_HELP_AFTER,
  PRIMITIVE_HELP_AFTER,
  UI_HELP_AFTER,
} from "./lib/help-text.js";
import { isScripted } from "./lib/scaffold-flags.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const packageJson = JSON.parse(
  readFileSync(path.join(packageRoot, "package.json"), "utf-8")
) as { version: string };

function applyNoColor(noColor: boolean | undefined): void {
  if (noColor) {
    process.env.NO_COLOR = "1";
    process.env.FORCE_COLOR = "0";
  }
}

interface ScaffoldCommandOptions {
  category?: string;
  dryRun?: boolean;
  framework?: string;
  keywords?: string;
  noColor?: boolean;
  noInput?: boolean;
  quiet?: boolean;
  registryName?: string;
  skipBuild?: boolean;
  skipDemo?: boolean;
  withDemo?: boolean;
  yes?: boolean;
}

function assertScriptedArgs(
  label: string,
  name: string | undefined,
  value: string | undefined,
  valueFlag: string
): void {
  if (name && value) {
    return;
  }

  console.error(
    `Non-interactive mode requires <name> and ${valueFlag}.\n` +
      `Example: bun run ${label} <name> ${valueFlag}=... --yes`
  );
  process.exit(1);
}

function assertScriptedName(label: string, name: string | undefined): void {
  if (name) {
    return;
  }

  console.error(
    "Non-interactive mode requires <name> or <slug>.\n" +
      `Example: bun run ${label} <name> --yes`
  );
  process.exit(1);
}

function mapScaffoldOptions(options: ScaffoldCommandOptions) {
  return {
    category: options.category,
    dryRun: options.dryRun,
    framework: options.framework,
    keywords: options.keywords,
    noInput: options.noInput,
    quiet: options.quiet,
    registryName: options.registryName,
    skipBuild: options.skipBuild,
    skipDemo: options.skipDemo,
    withDemo: options.withDemo,
    yes: options.yes,
  };
}

const sharedScaffoldOptions = [
  ["-n, --dry-run", "Preview files without writing"],
  ["--no-input", "Disable prompts (requires flags or positional args)"],
  ["-q, --quiet", "Minimal output; suppress registry:build logs"],
  ["--no-color", "Disable ANSI color output"],
] as const;

const program = new Command();

program
  .name("www-cli")
  .description("Internal Sora UI contributor CLI for apps/www scaffolding")
  .version(packageJson.version)
  .option("--no-color", "Disable ANSI color output");

const create = program
  .command("create")
  .description(
    "Scaffold registry content (interactive wizard when no subcommand)"
  )
  .addHelpText("after", CREATE_HELP_AFTER);

create
  .command("primitive")
  .description("Create a Motion primitive under apps/www/registry/primitives")
  .argument("[name]", "Component slug in kebab-case")
  .option(
    "-c, --category <category>",
    "Primitive category (texts, buttons, disclosure, effects, animate)"
  )
  .option("--with-demo", "Also create registry/demo/primitives/... manual demo")
  .option("--skip-build", "Skip running registry:build after scaffolding")
  .option("-y, --yes", "Non-interactive mode (requires name and --category)")
  .option(...sharedScaffoldOptions[0])
  .option(...sharedScaffoldOptions[1])
  .option(...sharedScaffoldOptions[2])
  .option(...sharedScaffoldOptions[3])
  .addHelpText("after", PRIMITIVE_HELP_AFTER)
  .action(async (name: string | undefined, options: ScaffoldCommandOptions) => {
    applyNoColor(options.noColor ?? program.opts().noColor);

    const scripted = isScripted(options);
    if (scripted) {
      assertScriptedArgs(
        "create:primitive",
        name,
        options.category,
        "--category"
      );
    }

    try {
      await runCreatePrimitive(name, mapScaffoldOptions(options));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

create
  .command("ui")
  .description("Create a UI component under apps/www/registry/ui")
  .argument("[name]", "Component slug in kebab-case")
  .option("-f, --framework <framework>", "UI framework (base, radix)")
  .option(
    "--with-demo",
    "Create registry/demo/ui/... manual demo (default in --yes mode)"
  )
  .option("--skip-demo", "Skip manual demo folder")
  .option("--skip-build", "Skip running registry:build after scaffolding")
  .option("-y, --yes", "Non-interactive mode (requires name and --framework)")
  .option(...sharedScaffoldOptions[0])
  .option(...sharedScaffoldOptions[1])
  .option(...sharedScaffoldOptions[2])
  .option(...sharedScaffoldOptions[3])
  .addHelpText("after", UI_HELP_AFTER)
  .action(async (name: string | undefined, options: ScaffoldCommandOptions) => {
    applyNoColor(options.noColor ?? program.opts().noColor);

    const scripted = isScripted(options);
    if (scripted) {
      assertScriptedArgs("create:ui", name, options.framework, "--framework");
    }

    try {
      await runCreateUi(name, mapScaffoldOptions(options));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

create
  .command("catalog")
  .description("Create a layout showcase under apps/www/content/catalog")
  .argument("[slug]", "Catalog page slug in kebab-case")
  .option(
    "-c, --category <category>",
    "Underlying primitive category (texts, buttons, disclosure, effects, animate)"
  )
  .option(
    "-r, --registry-name <registryName>",
    "Underlying registry component name (defaults to slug)"
  )
  .option("--skip-build", "Skip running registry:build after scaffolding")
  .option("-y, --yes", "Non-interactive mode (requires slug)")
  .option(...sharedScaffoldOptions[0])
  .option(...sharedScaffoldOptions[1])
  .option(...sharedScaffoldOptions[2])
  .option(...sharedScaffoldOptions[3])
  .addHelpText("after", CATALOG_HELP_AFTER)
  .action(async (slug: string | undefined, options: ScaffoldCommandOptions) => {
    applyNoColor(options.noColor ?? program.opts().noColor);

    const scripted = isScripted(options);
    if (scripted) {
      assertScriptedName("create:catalog", slug);
    }

    try {
      await runCreateCatalog(slug, mapScaffoldOptions(options));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

create
  .command("icon")
  .description("Create an animated icon under apps/www/registry/icons")
  .argument("[name]", "Icon name in kebab-case")
  .option(
    "-k, --keywords <keywords>",
    "Comma-separated keywords for registry search"
  )
  .option(
    "--with-demo",
    "Create registry/demo/icons/... manual demo (default in --yes mode)"
  )
  .option("--skip-demo", "Skip manual demo folder")
  .option("--skip-build", "Skip running registry:build after scaffolding")
  .option("-y, --yes", "Non-interactive mode (requires name)")
  .option(...sharedScaffoldOptions[0])
  .option(...sharedScaffoldOptions[1])
  .option(...sharedScaffoldOptions[2])
  .option(...sharedScaffoldOptions[3])
  .addHelpText("after", ICON_HELP_AFTER)
  .action(async (name: string | undefined, options: ScaffoldCommandOptions) => {
    applyNoColor(options.noColor ?? program.opts().noColor);

    const scripted = isScripted(options);
    if (scripted) {
      assertScriptedName("create:icon", name);
    }

    const opts = mapScaffoldOptions(options);
    let withDemo: boolean | undefined = options.withDemo;
    if (options.skipDemo === true) {
      withDemo = false;
    } else if (withDemo === undefined && scripted) {
      withDemo = true;
    }

    try {
      await runCreateIcon(name, {
        ...opts,
        withDemo,
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

create.action(async () => {
  applyNoColor(program.opts().noColor);

  try {
    await runCreateWizard();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
});

interface DoctorCommandOptions {
  all?: boolean;
  noColor?: boolean;
  quiet?: boolean;
  strict?: boolean;
}

program
  .command("doctor")
  .description("Audit registry, docs, meta.json, and demoProps consistency")
  .argument(
    "[name]",
    "Component name to check (e.g. text-effect, base/accordion)"
  )
  .option("--all", "Audit the entire registry instead of a specific component")
  .option(
    "-q, --quiet",
    "Minimal output; only show errors or single status line"
  )
  .option("--no-color", "Disable ANSI color output")
  .option(
    "--strict",
    "Treat warnings as errors (fail with exit code 1 on warnings)"
  )
  .action(async (name: string | undefined, options: DoctorCommandOptions) => {
    applyNoColor(options.noColor ?? program.opts().noColor);

    try {
      await runDoctor({
        targetName: name,
        all: options.all,
        noColor: options.noColor ?? program.opts().noColor,
        quiet: options.quiet,
        strict: options.strict,
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

await program.parseAsync(process.argv);
