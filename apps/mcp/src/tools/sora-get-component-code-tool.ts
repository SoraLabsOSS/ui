import { MCPTool } from "mcp-framework";
import { z } from "zod";
import {
  getItemSource,
  RegistryFetchError,
} from "../registry/sora-registry-source.js";

const schema = z.object({
  name: z
    .string()
    .describe(
      'Component or hook name as returned by list_components, e.g. "char-stagger-button" or "hooks-use-auto-height"'
    ),
});

type GetComponentCodeInput = z.infer<typeof schema>;

class SoraGetComponentCodeTool extends MCPTool<GetComponentCodeInput> {
  name = "get_component_code";
  description =
    "Get the full source code for a specific Sora UI component or hook by name, ready to paste in without running the install CLI.";
  protected schema = schema;
  protected useStringify = false;

  protected async execute(input: GetComponentCodeInput): Promise<string> {
    try {
      const item = await getItemSource(input.name);
      if (!item) {
        return `Component "${input.name}" not found. Use list_components to see available components.`;
      }

      const files = item.files
        .map((file) =>
          [
            `File: ${file.path} → ${file.target ?? "(default target)"}`,
            "```tsx",
            file.content ?? "(no content available for this file)",
            "```",
          ].join("\n")
        )
        .join("\n\n");

      return [`# ${item.title ?? item.name}`, "", files].join("\n");
    } catch (error) {
      if (error instanceof RegistryFetchError) {
        return `Failed to get component code: ${error.message}`;
      }
      throw error;
    }
  }
}

export default SoraGetComponentCodeTool;
