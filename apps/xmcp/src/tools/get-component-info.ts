import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import {
  formatDetail,
  formatList,
  getItemSource,
  listInstallableItems,
  RegistryFetchError,
} from "../registry/sora-registry-source";

export const schema = {
  name: z
    .string()
    .optional()
    .describe(
      'Component or hook name, e.g. "stagger-button" or "hooks-use-auto-height". Omit to list all installable components/hooks instead.'
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
};

export const metadata: ToolMetadata = {
  name: "get_component_info",
  description:
    'Get Sora UI component/hook info: with `name`, returns install guidance (recommending the sora-cli command) and dependencies — pass `includeSource: true` to also get the full source (skip this by default and just install, then read the installed file directly if you need the code), and `cwd` (e.g. "packages/ui") when installing into a specific workspace of a monorepo so the suggested command includes sora-cli\'s `--cwd` flag; without `name`, lists all installable components and hooks.',
  annotations: {
    title: "Get Component Information",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getComponentInfo({
  name,
  type,
  includeSource,
  cwd,
}: InferSchema<typeof schema>) {
  try {
    if (!name) {
      let items = await listInstallableItems();
      if (type) {
        items = items.filter((item) => item.type === type);
      }
      return formatList(items);
    }

    const item = await getItemSource(name);
    if (!item) {
      return `Component "${name}" not found. Call get_component_info without a name to see available components.`;
    }

    return formatDetail(item, includeSource ?? false, cwd);
  } catch (error) {
    if (error instanceof RegistryFetchError) {
      return `Failed to get component info: ${error.message}`;
    }
    throw error;
  }
}
