import { cancel, isCancel, select } from "@clack/prompts";
import { isInteractiveTerminal, nonInteractiveHint } from "../lib/terminal.js";
import { runCreateCatalog } from "./create-catalog.js";
import { runCreateIcon } from "./create-icon.js";
import { runCreatePrimitive } from "./create-primitive.js";
import { runCreateUi } from "./create-ui.js";

export async function runCreateWizard(): Promise<void> {
  if (!isInteractiveTerminal()) {
    throw new Error(
      nonInteractiveHint(
        [
          "bun run create:primitive <name> --category=effects --yes",
          "bun run create:ui <name> --framework=base --yes",
          "bun run create:catalog <slug> --yes",
          "bun run create:icon <name> --yes",
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
        hint: "content/catalog → /catalog",
      },
      {
        value: "icon",
        label: "Animated icon",
        hint: "registry/icons",
      },
    ],
  });

  if (isCancel(tier)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  if (tier === "catalog") {
    await runCreateCatalog(undefined, {});
    return;
  }

  if (tier === "icon") {
    await runCreateIcon(undefined, {});
    return;
  }

  if (tier === "primitive") {
    await runCreatePrimitive(undefined, {});
    return;
  }

  await runCreateUi(undefined, {});
}
