import { MCPTool } from "mcp-framework";
import { z } from "zod";
import {
  getItemSource,
  listInstallableItems,
  RegistryFetchError,
  type RegistryItem,
} from "../registry/sora-registry-source.js";

const schema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      'Component or hook name, e.g. "char-stagger-button" or "hooks-use-auto-height". Omit to list all installable components/hooks instead.'
    ),
  type: z
    .enum(["registry:ui", "registry:hook"])
    .optional()
    .describe(
      "Only used when `name` is omitted — filter the listing to a specific item type."
    ),
  includeSource: z
    .boolean()
    .optional()
    .describe(
      "Only used when `name` is given. Defaults to false — the response is just install guidance + dependencies, since running the recommended sora-cli command already puts the real file on disk for you to read directly. Set true only if you want the source without installing (e.g. to inspect before deciding)."
    ),
  cwd: z
    .string()
    .optional()
    .describe(
      'Monorepo workspace to install into, e.g. "packages/ui" — passed through as sora-cli\'s --cwd flag so the correct workspace tsconfig/alias is used. Omit for a single-package project or the repo root.'
    ),
});

type GetComponentInfoInput = z.infer<typeof schema>;

function formatList(items: RegistryItem[]): string {
  if (items.length === 0) {
    return "No installable components found.";
  }

  return items
    .map(
      (item) =>
        `- **${item.title ?? item.name}** (\`${item.name}\`) — ${item.description ?? "No description"}`
    )
    .join("\n");
}

function formatSource(item: RegistryItem): string {
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

  return [
    "",
    "## Source",
    "For reference — installing via sora-cli above already writes these with the right import aliases.",
    "",
    files,
  ].join("\n");
}

const UNSAFE_CWD_CHARS = /[`;$&|<>(){}"'\n\r]/;

function formatDetail(
  item: RegistryItem,
  includeSource: boolean,
  cwd?: string
): string {
  const dependencies = item.dependencies?.join(", ") || "none";
  const registryDependencies = item.registryDependencies?.join(", ") || "none";
  const fileTargets = item.files
    .map((file) => `  - ${file.path} → ${file.target ?? "(default target)"}`)
    .join("\n");

  const trimmedCwd = cwd?.trim();
  const cwdWarning =
    trimmedCwd && UNSAFE_CWD_CHARS.test(trimmedCwd)
      ? `**Warning:** the provided \`cwd\` ("${trimmedCwd}") contains characters that shouldn't appear in a path — do not interpolate it into a shell command as-is; ask the user to confirm the workspace path first.`
      : "";
  const cwdFlag = trimmedCwd && !cwdWarning ? ` --cwd "${trimmedCwd}"` : "";

  const lines = [
    `# ${item.title ?? item.name}`,
    item.description ?? "",
    "",
    "## Install",
    ...(cwdWarning ? [cwdWarning, ""] : []),
    `Run this in the user's project (not this MCP server, which has no access to their files): \`npx @soralabsoss/sora-cli add ${item.name}${cwdFlag} --yes\` — fetches this component with the correct import aliases for their project and installs its dependencies. Once installed, read the actual file on disk if you need to see the code — don't re-fetch it here.`,
    "**Always include `--yes`** when running this yourself (non-interactively): without it, `sora-cli` prints a confirmation prompt and — since your shell has no TTY — silently exits 0 without installing anything. `--yes` skips that prompt so the install actually runs. Only omit `--yes` if you're relaying the command for a human to run themselves in their own interactive terminal.",
    cwdFlag
      ? "In a monorepo, `--cwd` points sora-cli at the target workspace (e.g. `packages/ui`) so it resolves that workspace's tsconfig paths/aliases instead of the repo root's."
      : "In a monorepo, if you know which workspace the user wants (e.g. `packages/ui`), pass `cwd` to this tool or add `--cwd <workspace>` to the command yourself — otherwise sora-cli installs relative to the repo root, which is usually wrong for a nested package.",
    `Already installed and want to check for upstream changes? \`npx @soralabsoss/sora-cli diff ${item.name}${cwdFlag}\` (safe to run without \`--yes\` — it never prompts or writes anything).`,
    `(Already using the shadcn registry scope instead? \`npx shadcn@latest add @soralabs/${item.name}\` works too — run \`npx shadcn@latest registry add @soralabs\` once first if it isn't configured yet.)`,
    "",
    "## Details",
    `Dependencies: ${dependencies}`,
    `Registry dependencies: ${registryDependencies}`,
    "Files:",
    fileTargets,
  ];

  if (includeSource) {
    lines.push(formatSource(item));
  }

  return lines.join("\n");
}

class SoraGetComponentInfoTool extends MCPTool<GetComponentInfoInput> {
  name = "get_component_info";
  description =
    'Get Sora UI component/hook info: with `name`, returns install guidance (recommending the sora-cli command) and dependencies — pass `includeSource: true` to also get the full source (skip this by default and just install, then read the installed file directly if you need the code), and `cwd` (e.g. "packages/ui") when installing into a specific workspace of a monorepo so the suggested command includes sora-cli\'s `--cwd` flag; without `name`, lists all installable components and hooks.';
  protected schema = schema;
  protected useStringify = false;

  protected async execute(input: GetComponentInfoInput): Promise<string> {
    try {
      if (!input.name) {
        let items = await listInstallableItems();
        if (input.type) {
          items = items.filter((item) => item.type === input.type);
        }
        return formatList(items);
      }

      const item = await getItemSource(input.name);
      if (!item) {
        return `Component "${input.name}" not found. Call get_component_info without a name to see available components.`;
      }

      return formatDetail(item, input.includeSource ?? false, input.cwd);
    } catch (error) {
      if (error instanceof RegistryFetchError) {
        return `Failed to get component info: ${error.message}`;
      }
      throw error;
    }
  }
}

export default SoraGetComponentInfoTool;
