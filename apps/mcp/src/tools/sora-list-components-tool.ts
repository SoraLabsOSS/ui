import { MCPTool } from "mcp-framework";
import { z } from "zod";
import {
  listInstallableItems,
  RegistryFetchError,
} from "../registry/sora-registry-source.js";

const schema = z.object({
  type: z
    .enum(["registry:ui", "registry:hook"])
    .optional()
    .describe(
      "Filter to a specific item type — omit to list all installable items"
    ),
});

type ListComponentsInput = z.infer<typeof schema>;

class SoraListComponentsTool extends MCPTool<ListComponentsInput> {
  name = "list_components";
  description =
    "List installable Sora UI components and hooks from the registry, with short descriptions. Use get_component_info for install details on a specific component.";
  protected schema = schema;
  protected useStringify = false;

  protected async execute(input: ListComponentsInput): Promise<string> {
    try {
      let items = await listInstallableItems();
      if (input.type) {
        items = items.filter((item) => item.type === input.type);
      }

      if (items.length === 0) {
        return "No installable components found.";
      }

      return items
        .map(
          (item) =>
            `- **${item.title ?? item.name}** (\`${item.name}\`) — ${item.description ?? "No description"}`
        )
        .join("\n");
    } catch (error) {
      if (error instanceof RegistryFetchError) {
        return `Failed to list components: ${error.message}`;
      }
      throw error;
    }
  }
}

export default SoraListComponentsTool;
