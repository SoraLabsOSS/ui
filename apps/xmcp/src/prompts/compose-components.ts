import type { InferSchema, PromptMetadata } from "xmcp";
import { z } from "zod";

export const schema = {
  intent: z
    .string()
    .describe(
      "The UI feature or pattern to build (e.g. 'Authentication dialog with animated tabs and spring submit button', 'Settings form with switches and tooltips')"
    ),
  components: z
    .array(z.string().min(1))
    .optional()
    .describe(
      "Optional list of suggested Sora components to compose (e.g. ['base-dialog', 'base-button', 'base-switch'])"
    ),
  framework: z
    .enum(["base", "radix", "auto"])
    .optional()
    .describe(
      "Preferred component foundation: 'base' (default Base UI), 'radix' (Radix UI), or 'auto'"
    ),
  cwd: z
    .string()
    .optional()
    .describe("Monorepo target workspace if applicable (e.g. 'packages/ui')"),
};

export const metadata: PromptMetadata = {
  name: "compose-components",
  title: "Compose Sora UI Components",
  description:
    "Prompt template to guide AI agents in composing multi-component Sora UI layouts with validation and guardrails",
  role: "user",
};

export default function composeComponentsPrompt({
  intent,
  components,
  framework = "base",
  cwd,
}: InferSchema<typeof schema>) {
  const compList = components?.length
    ? `\nSuggested components: ${components.map((c) => `\`${c}\``).join(", ")}`
    : "";
  const cwdClause = cwd ? ` in workspace \`${cwd}\`` : "";

  return `I want to build a Sora UI composition${cwdClause}:
Intent: "${intent}"${compList}
Preferred foundation: ${framework}

Please follow these step-by-step instructions to create the composition:

1. **Validate Proposed Components**:
   - Call \`validate_composition\` with the chosen components to verify registry dependencies, framework consistency, accessibility constraints, and RTL advice.
   - If mixing Base UI and Radix UI primitives, unify on ${framework === "radix" ? "Radix UI" : "Base UI"} to prevent runtime bloat and pattern mismatches.

2. **Retrieve Component Source & Instructions**:
   - For any component where you need to inspect props or import targets, call \`get_component_info\` with \`includeSource: true\`.
   - Install the components using the non-interactive CLI command:
     \`npx shadcn@latest add @soralabs/<component>... ${cwd ? `--cwd "${cwd}" ` : ""}--yes\`

3. **Adhere to Sora UI Architectural Guardrails**:
   - **Framework patterns**:
     - Base UI: Use the \`render={<Component />}\` pattern on triggers and primitives. Never use legacy \`asChild\`.
     - Radix UI: Use \`asChild\` Slot composition.
   - **Motion & Reduced Motion**: Always respect user motion preferences via \`useReducedMotion()\` from \`motion/react\`.
   - **Styling**: Support full Tailwind CSS overrides with \`cn(...)\`. Use logical CSS utilities (\`ps-*\`, \`pe-*\`, \`ms-*\`, \`me-*\`, \`border-s-*\`, \`border-e-*\`) for native RTL parity.
   - **Accessibility**: Never nest interactive elements (e.g., button inside button/trigger). Maintain proper keyboard navigation, focus trap synchronization, and ARIA labels.

4. **Generate the Complete Composition**:
   - Provide a complete, self-contained React TypeScript file ready to drop into the project.`;
}
