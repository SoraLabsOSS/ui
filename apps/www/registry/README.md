# Registry & docs flow

How to add and maintain components on the docs site (`apps/www`). Build script: [`scripts/build-registry.mts`](../scripts/build-registry.mts).

## Minimal flow (recommended)

```text
1. registry/{primitives|components}/<category>/<name>/
      index.tsx
      registry-item.json    ← meta.demoProps (Tweakpane + auto Code tab)

2. content/docs/.../<name>.mdx
      <ComponentPreview name="<name>" />
      <ComponentInstallation name="<name>" />

3. content/docs/.../meta.json   ← add page to Fumadocs tree (new section only)

4. bun run registry:build
```

You do **not** need `registry/demo/...` unless the usage example is complex (see [Manual demo](#manual-demo-optional)).

## On the docs site

| Part | Source | Notes |
|------|--------|-------|
| **Preview** | `ComponentPreview name="<name>"` | Loads primitive from `@/registry/...`, props from `meta.demoProps` |
| **Tweakpane** | `meta.demoProps` on the primitive `registry-item.json` | Top-level key = React export name (e.g. `TextReveal`) |
| **Code** | Auto-generated `demo-<name>` at build time; **updates live** when Tweakpane changes | Snippet uses `@/components/sora-ui/...` (post–`shadcn add` paths) |
| **Install** | `ComponentInstallation name="<name>"` | CLI tab in docs |

### `demoProps` (on the primitive `registry-item.json`)

```json
"meta": {
  "demoProps": {
    "TextReveal": {
      "text": { "value": "Blur Text Animation" },
      "splitBy": {
        "value": "words",
        "options": { "Words": "words", "Characters": "characters" }
      },
      "blur": { "value": 4, "min": 0, "max": 20, "step": 1 }
    }
  }
}
```

After `registry:build`, a log line `📝 Generated usage example: demo-<name>` means the Code tab snippet is ready (no demo file required).

While you adjust props in the Tweakpane, the **Code** tab re-renders the usage snippet with the current values (same generator as the build script).

## Manual demo (optional)

Add `registry/demo/{primitives|components}/<category>/<name>/` when:

- The example uses multiple components
- Layout or demo logic cannot be expressed via `demoProps` alone

Structure:

```text
registry/demo/primitives/texts/text-reveal/
  index.tsx              ← import from @/registry/... (runs in the monorepo)
  registry-item.json     ← registryDependencies: ["text-reveal"]
```

- A demo folder on disk **overrides** the auto-generated Code tab snippet.
- In `index.tsx`, use `@/registry/...`, not `@/components/sora-ui/...` (install paths exist only after the user runs `shadcn add`).
- `registry:build` still transforms the **displayed** Code tab content to `@/components/sora-ui/...`.

## What `registry:build` does

1. Merges `registry-item.json` files into `public/r/registry.json` (only items referenced in docs MDX).
2. Generates `__registry__/index.tsx` (preview + code for the docs app).
3. For each documented primitive with `demoProps` and **no** `demo-*` folder on disk → synthesizes a `demo-<name>` entry (`component: null`, `files[].content` only).
4. Runs `shadcn build` → JSON artifacts under `public/r/*.json`.

## Example: `text-reveal`

| File | Role |
|------|------|
| `registry/primitives/texts/text-reveal/index.tsx` | Component source |
| `registry/primitives/texts/text-reveal/registry-item.json` | Registry metadata + `demoProps` |
| `content/docs/texts/text-reveal.mdx` | `<ComponentPreview name="text-reveal" />` |
| `content/docs/texts/meta.json` | Sidebar (`root: true`, `pages`) |

## Commands

```bash
cd apps/www
bun run registry:build   # after changing registry or demoProps
bun dev                  # run the docs site
```

## See also

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — broader guide (icons, components, tweakpane field types)
- [shadcn registry item schema](https://ui.shadcn.com/docs/registry/registry-item-json)
