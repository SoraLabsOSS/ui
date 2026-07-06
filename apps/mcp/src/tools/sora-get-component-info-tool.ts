import { MCPTool } from "mcp-framework";
import { z } from "zod";
import {
  getItemByName,
  RegistryFetchError,
} from "../registry/sora-registry-source.js";

const schema = z.object({
  name: z
    .string()
    .describe(
      'Component or hook name as returned by list_components, e.g. "char-stagger-button" or "hooks-use-auto-height"'
    ),
});

type GetComponentInfoInput = z.infer<typeof schema>;

class SoraGetComponentInfoTool extends MCPTool<GetComponentInfoInput> {
  name = "get_component_info";
  description =
    "Get the install command, dependencies, and file targets for a specific Sora UI component or hook by name.";
  protected schema = schema;
  protected useStringify = false;

  protected async execute(input: GetComponentInfoInput): Promise<string> {
    try {
      const item = await getItemByName(input.name);
      if (!item) {
        return `Component "${input.name}" not found. Use list_components to see available components.`;
      }

      const dependencies = item.dependencies?.join(", ") || "none";
      const registryDependencies =
        item.registryDependencies?.join(", ") || "none";
      const files = item.files
        .map(
          (file) => `  - ${file.path} → ${file.target ?? "(default target)"}`
        )
        .join("\n");

      return [
        `# ${item.title ?? item.name}`,
        item.description ?? "",
        "",
        `Install: npx shadcn@latest add @soralabs/${item.name}`,
        "(Run `npx shadcn@latest registry add @soralabs` once first if the registry scope isn't configured yet — see /docs/installation.)",
        `Dependencies: ${dependencies}`,
        `Registry dependencies: ${registryDependencies}`,
        "Files:",
        files,
      ].join("\n");
    } catch (error) {
      if (error instanceof RegistryFetchError) {
        return `Failed to get component info: ${error.message}`;
      }
      throw error;
    }
  }
}

export default SoraGetComponentInfoTool;
