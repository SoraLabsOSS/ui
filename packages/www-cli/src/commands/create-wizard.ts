import { cancel, isCancel, select } from "@clack/prompts";
import { isInteractiveTerminal, nonInteractiveHint } from "../lib/terminal.js";
import { runCreatePrimitive } from "./create-primitive.js";
import { runCreateUi } from "./create-ui.js";

export async function runCreateWizard(): Promise<void> {
  if (!isInteractiveTerminal()) {
    throw new Error(
      nonInteractiveHint(
        [
          "bun run create:primitive <name> --category=effects --yes",
          "bun run create:ui <name> --framework=base --yes",
        ].join("\n  ")
      )
    );
  }

  const tier = await select({
    message: "What do you want to scaffold?",
    options: [
      {
        value: "primitive",
        label: "Motion primitive",
        hint: "registry/primitives → /docs/motion",
      },
      {
        value: "ui",
        label: "UI component",
        hint: "registry/ui → /ui (Base or Radix)",
      },
      {
        value: "catalog",
        label: "Catalog page",
        hint: "Coming in Phase 3",
      },
    ],
  });

  if (isCancel(tier)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  if (tier === "catalog") {
    cancel(
      "Catalog scaffolding is not available yet. Use Phase 3 (create catalog) when it lands."
    );
    process.exit(0);
  }

  if (tier === "primitive") {
    await runCreatePrimitive(undefined, {});
    return;
  }

  await runCreateUi(undefined, {});
}
