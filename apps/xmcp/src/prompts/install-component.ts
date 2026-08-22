import type { InferSchema, PromptMetadata } from "xmcp";
import { z } from "zod";

export const schema = {
  component: z
    .string()
    .describe(
      "The name of the Sora UI component or hook to install (e.g. 'stagger-button', 'motion-popover')"
    ),
  cwd: z
    .string()
    .optional()
    .describe("Monorepo target workspace if applicable (e.g. 'packages/ui')"),
};

export const metadata: PromptMetadata = {
  name: "install-component",
  title: "Install Sora UI Component",
  description:
    "Prompt template to guide installing and configuring a Sora UI component",
  role: "user",
};

export default function installComponentPrompt({
  component,
  cwd,
}: InferSchema<typeof schema>) {
  const cwdClause = cwd ? ` into the workspace \`${cwd}\`` : "";
  return `Please help me install the Sora UI component \`${component}\`${cwdClause}. 
First, fetch its info using the \`get_component_info\` tool.
Then run the recommended non-interactive install command \`npx shadcn@latest add @soralabs/${component}${cwd ? ` --cwd "${cwd}"` : ""} --yes\` (or \`npx @soralabsoss/sora-cli add ${component}${cwd ? ` --cwd "${cwd}"` : ""} --yes\`).
Finally, verify the installed component file and explain how to import and use it in my application.`;
}
