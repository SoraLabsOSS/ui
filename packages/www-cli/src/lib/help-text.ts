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
  $ bun run create catalog --help
  $ bun run create icon --help

Docs: ${DOCS_CONTRIBUTING}
`;

export const CATALOG_HELP_AFTER = `
Examples:
  $ bun run create:catalog hero-showcase --yes
  $ bun run create:catalog hero-showcase --dry-run
  $ bun run create:catalog hero-showcase --category=effects --skip-build

Docs: ${DOCS_CONTRIBUTING} (Flow 3 — Catalog pages)
`;

export const ICON_HELP_AFTER = `
Examples:
  $ bun run create:icon sparkles --yes
  $ bun run create:icon sparkles --dry-run
  $ bun run create:icon sparkles --keywords=magic,star --skip-build

Docs: ${DOCS_CONTRIBUTING}
`;
