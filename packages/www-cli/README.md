# `@workspace/www-cli`

Internal contributor CLI for scaffolding registry content in `apps/www`. Not published to npm — workspace-only, invoked from the monorepo root.

**Consumer install CLI (separate):** [`@soralabsoss/sora-cli`](https://github.com/SoraLabsOSS/cli) (`add`, `list`, `doctor`). Do not merge scaffold logic into that repo.

## Commands

From the repo root:

```bash
# Interactive wizard (Motion / UI / Catalog placeholder)
bun run create

# Motion primitive
bun run create:primitive
bun run create:primitive my-effect --category=effects --yes
bun run create:primitive my-effect --category=effects --yes --with-demo
bun run create:primitive my-effect --category=effects --yes --skip-build

# UI component (Base or Radix)
bun run create:ui
bun run create:ui my-widget --framework=base --yes
bun run create:ui my-widget --framework=radix --yes --skip-demo
```

| Flag | `create:primitive` | `create:ui` |
|------|----------------------|-------------|
| `--yes` / `--no-input` | Non-interactive; requires `<name>` + `--category` | Non-interactive; requires `<name>` + `--framework` |
| `--dry-run` / `-n` | Preview files; no writes | Same |
| `-q` / `--quiet` | Minimal output; silent `registry:build` | Same |
| `--no-color` | Disable ANSI color | Same |
| `--skip-build` | Skip `registry:build` after scaffold | Same |
| `--with-demo` | Opt-in manual demo folder | Default on in `--yes` / `--no-input` mode |
| `--skip-demo` | — | Skip manual demo folder |

## Tests

```bash
bun run test:www-cli          # fast (integration uses --skip-build)
bun run test:www-cli:slow     # includes registry:build integration (WWW_CLI_RUN_REGISTRY_BUILD=1)
```

Inside this package: `bun test`, `bun run test:slow`, `bun run check-types`, `bun run lint`.

## Roadmap checklist

### Done

- [x] **Phase 0** — Design notes (`apps/www/sandbox/www-cli-idea.md`)
- [x] **Phase 1** — `create primitive` (registry + MDX + `content/docs/motion/meta.json` + optional demo)
- [x] **Phase 2** — `create ui` (`base` / `radix`, demo default in `--yes` mode)
- [x] **Polish** — `bun run create` wizard (Catalog shows “Phase 3” placeholder)
- [x] **Polish** — `registry:build` skip log suggests `create:primitive` / `create:ui`
- [x] **Polish** — Title casing for acronyms in slugs (`www-cli-smoke-test` → `WWW CLI Smoke Test`)
- [x] **Polish** — Optional slow test via `WWW_CLI_RUN_REGISTRY_BUILD=1`
- [x] **Polish** — clig.dev alignment: `--no-input`, `--dry-run`, `--quiet`, help examples

### Phase 3 — not started

Use this as the implementation checklist for the next milestone.

#### `create catalog`

- [ ] **Command** — `bun run create:catalog` → `create catalog <slug>` in `src/index.ts`
- [ ] **Resolve options** — `src/lib/resolve-create-catalog-options.ts` (slug validation, `--yes`, interactive prompts)
- [ ] **Paths** — `getCatalogPaths()` in `src/lib/paths.ts`:
  - `content/catalog/<slug>.mdx`
  - `content/catalog/meta.json` (flat slug list, no `---Section---` markers)
- [ ] **Templates** — `src/lib/catalog-templates.ts`:
  - Frontmatter: `title`, `description`, `category`, `author`, `registryName`
  - `<ComponentInstallation name="..." />` skeleton
  - Usage section placeholder
- [ ] **Meta insert** — `insertIntoCatalogMeta()` in `src/lib/meta-json.ts` (append slug to `pages[]`)
- [ ] **Command impl** — `src/commands/create-catalog.ts` (write files, patch meta, optional `registry:build`)
- [ ] **Wizard** — wire Catalog tier in `src/commands/create-wizard.ts` (remove placeholder exit)
- [ ] **Root script** — `"create:catalog"` in root `package.json`
- [ ] **CONTRIBUTING.md** — Flow 3 shortcut for `create:catalog`
- [ ] **Tests** — unit (templates, meta-json) + integration with fixture cleanup in `src/test/fixture.ts`

**Catalog conventions to respect** (see existing pages under `content/catalog/`):

- Catalog pages are **layout showcases** for primitives already in the registry — no new `registry/` folder by default.
- `registryName` in frontmatter should match an installable registry item referenced in MDX.
- Routes: `/catalog/<slug>`; listed in `content/catalog/meta.json`.

#### `doctor` (optional, same phase or follow-up)

- [ ] **Command** — `www-cli doctor` (read-only audit, no file writes)
- [ ] **Checks:**
  - Registry folder exists but no matching MDX in `content/docs/motion`, `content/ui`, or `content/catalog`
  - `meta.demoProps` keys do not match exported component names in `index.tsx`
  - Slug in `meta.json` but MDX file missing (or vice versa)
  - Undocumented items that `registry:build` would skip (mirror `collectDocumentedNames` rules)
- [ ] **Output** — actionable fixes (`bun run create:…`, add MDX, fix `demoProps` key)
- [ ] **Tests** — fixture repo slice or mocked file tree

#### Phase 3 verification

- [ ] `bun run test:www-cli` passes
- [ ] `cd apps/www && bun run registry:build` after scaffolding a test catalog page
- [ ] `cd apps/www && bun run test:registry` passes
- [ ] Manual smoke: `bun run dev:www` → `/catalog/<slug>`

### Phase 4 — Section Icon (not started)

Scaffolding for animated icons (`registry/icons/<name>/`).

#### `create icon`

- [ ] **Command** — `bun run create:icon` → `create icon <name>` in `src/index.ts`
- [ ] **Resolve options** — `src/lib/resolve-create-icon-options.ts` (icon name/slug, keywords, `--yes`)
- [ ] **Paths** — `getIconPaths()` in `src/lib/paths.ts`:
  - `registry/icons/<name>/index.tsx`
  - `registry/icons/<name>/registry-item.json` (`name: "icons-<name>"`, `target: "components/sora-ui/icons/<name>.tsx"`, dependencies: `["motion"]`, registryDependencies: `["@soralabs/icons-icon"]`)
  - Optional demo: `registry/demo/icons/<name>/index.tsx`
  - Docs / showcase entry if applicable
- [ ] **Templates** — `src/lib/icon-templates.ts`:
  - Component template extending `AnimateIcon` / Motion SVG path animations
  - `registry-item.json` template with schema and keywords
- [ ] **Command impl** — `src/commands/create-icon.ts`
- [ ] **Wizard** — wire icon option in `src/commands/create-wizard.ts`
- [ ] **Root script** — `"create:icon"` in root `package.json`
- [ ] **Tests** — unit & integration tests for icon scaffolding

## Package layout

```text
packages/www-cli/
  src/
    index.ts                    # commander entry
    commands/
      create-primitive.ts
      create-ui.ts
      create-wizard.ts
      create-catalog.ts         # Phase 3
      create-icon.ts            # Phase 4
    lib/
      paths.ts
      naming.ts
      meta-json.ts
      templates.ts              # motion primitives
      ui-templates.ts
      catalog-templates.ts      # Phase 3
      icon-templates.ts         # Phase 4
      registry-build.ts
      resolve-create-*-options.ts
    test/
      fixture.ts
      env.ts
```

## References

- `CONTRIBUTING.md` — Flow 1 (UI), Flow 2 (Motion), Flow 3 (Catalog)
- `apps/www/registry/README.md` — `demoProps`, manual demos, `registry:build`
- `apps/www/scripts/build-registry.mts` — `collectDocumentedNames`, undocumented skip hints
- `apps/www/scripts/test-registry-integrity.mts` — post-build verification
