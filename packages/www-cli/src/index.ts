#!/usr/bin/env bun

import { Command } from "commander";
import { runCreatePrimitive } from "./commands/create-primitive.js";

const program = new Command();

program
  .name("www-cli")
  .description("Internal Sora UI contributor CLI for apps/www scaffolding")
  .version("0.0.0");

const create = program
  .command("create")
  .description("Scaffold registry content");

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
  .action(async (name: string | undefined, options) => {
    try {
      if (options.yes && !(name && options.category)) {
        console.error(
          "Non-interactive mode requires <name> and --category <category>."
        );
        process.exit(1);
      }

      await runCreatePrimitive(name, {
        category: options.category,
        withDemo: options.withDemo,
        skipBuild: options.skipBuild,
        yes: options.yes,
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

await program.parseAsync(process.argv);
