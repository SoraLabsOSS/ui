export const DOCS_CONTRIBUTING = "CONTRIBUTING.md";

export const PRIMITIVE_HELP_AFTER = `
Examples:
  $ bun run create:primitive my-effect --category=effects --yes
  $ bun run create:primitive my-effect --category=effects --dry-run
  $ bun run create:primitive my-effect --category=effects --no-input --skip-build

Docs: ${DOCS_CONTRIBUTING} (Flow 2 — Motion primitives)
`;

export const UI_HELP_AFTER = `
Examples:
  $ bun run create:ui my-widget --framework=base --yes
  $ bun run create:ui my-widget --framework=radix --dry-run
  $ bun run create:ui my-widget --framework=base --no-input --skip-build

Docs: ${DOCS_CONTRIBUTING} (Flow 1 — UI components)
`;

export const CREATE_HELP_AFTER = `
Examples:
  $ bun run create
  $ bun run create primitive --help
  $ bun run create ui --help

Docs: ${DOCS_CONTRIBUTING}
`;
