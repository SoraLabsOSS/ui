import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import {
  getItemSource,
  RegistryFetchError,
} from "../registry/sora-registry-source";

export const schema = {
  components: z
    .array(z.string().min(1))
    .min(1)
    .max(12)
    .describe("Installable Sora registry names to compose together."),
};

export const metadata: ToolMetadata = {
  name: "validate_composition",
  description:
    "Validate a proposed Sora UI composition against component dependencies and agent metadata. Use this before generating a multi-component UI.",
  annotations: {
    title: "Validate UI Composition",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function validateComposition({
  components,
}: InferSchema<typeof schema>) {
  try {
    const items = await Promise.all(
      components.map((name) => getItemSource(name))
    );
    const missing = components.filter((_, index) => !items[index]);
    if (missing.length > 0) {
      return `Unknown registry components: ${missing.join(", ")}. Call get_component_info without a name to list valid items.`;
    }

    const resolved = items.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );
    const names = new Set(resolved.map((item) => item.name));
    const dependencyWarnings = resolved.flatMap((item) =>
      (item.registryDependencies ?? [])
        .filter((dependency) => dependency.startsWith("@soralabs/"))
        .map((dependency) => dependency.slice("@soralabs/".length))
        .filter((dependency) => !names.has(dependency))
        .map(
          (dependency) =>
            `${item.name} expects registry dependency ${dependency}; include it or let shadcn install it transitively.`
        )
    );
    const metadata = resolved.flatMap((item) => {
      const agent = item.meta?.agentMetadata;
      if (!agent || typeof agent !== "object") {
        return [`${item.name} has no published agent metadata.`];
      }
      const value = agent as {
        a11yConstraints?: string[];
        compositionRules?: string[];
        motionEngine?: string;
      };
      return [
        ...(value.a11yConstraints ?? []).map(
          (constraint) => `${item.name}: ${constraint}`
        ),
        ...(value.compositionRules ?? []).map(
          (rule) => `${item.name}: ${rule}`
        ),
        ...(value.motionEngine
          ? [`${item.name} motion: ${value.motionEngine}`]
          : []),
      ];
    });

    return [
      "# Composition validation",
      `Components: ${components.join(", ")}`,
      dependencyWarnings.length
        ? `\n## Dependency warnings\n${dependencyWarnings.map((warning) => `- ${warning}`).join("\n")}`
        : "\n## Dependency warnings\n- None",
      metadata.length
        ? `\n## Constraints and rules\n${metadata.map((rule) => `- ${rule}`).join("\n")}`
        : "\n## Constraints and rules\n- No metadata published.",
      "\nUse these constraints when generating the composition; this tool does not modify files.",
    ].join("\n");
  } catch (error) {
    if (error instanceof RegistryFetchError) {
      return `Composition validation failed: ${error.message}`;
    }
    throw error;
  }
}
