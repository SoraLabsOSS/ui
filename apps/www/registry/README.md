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

### UI kit (`/ui`)

Same registry + preview flow, but docs live under `content/ui/` (flat MDX + `content/ui/meta.json`) instead of `content/docs/primitives/`:

```text
1. registry/primitives/base/<name>/index.tsx + registry-item.json
2. content/ui/<name>.mdx  ← ComponentPreview / ComponentInstallation
3. content/ui/meta.json   ← sidebar pages
4. bun run registry:build
```

You do **not** need `registry/demo/...` unless the usage example is complex (see [Manual demo](#manual-demo-optional)).

## On the docs site

| Part | Source | Notes |
|------|--------|-------|
| **Preview** | `ComponentPreview name="<name>"` | Loads primitive from `@/registry/...`, props from `meta.demoProps` |
| **Tweakpane** | `meta.demoProps` on the primitive `registry-item.json` | Top-level key = React export name (e.g. `TextEffect`) |
| **Code** | Auto-generated `demo-<name>` at build time; **updates live** when Tweakpane changes | Snippet uses `@/components/sora-ui/...` (post–`shadcn add` paths) |
| **Install** | `ComponentInstallation name="<name>"` | CLI tab in docs |

### `demoProps` (on the primitive `registry-item.json`)

```json
"meta": {
  "demoProps": {
    "TextEffect": {
      "children": { "value": "Motion-first text effects" },
      "preset": {
        "value": "fade-in-blur",
        "options": { "Fade in blur": "fade-in-blur", "Slide": "slide" }
      },
      "scrollTrigger": { "value": true }
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
registry/demo/primitives/texts/text-reveal-mask/
  index.tsx              ← import from @/registry/... (runs in the monorepo)
  registry-item.json     ← registryDependencies: ["text-reveal-mask"]
```

- A demo folder on disk **overrides** the auto-generated Code tab snippet.
- In `index.tsx`, use `@/registry/...`, not `@/components/sora-ui/...` (install paths exist only after the user runs `shadcn add`).
- `registry:build` still transforms the **displayed** Code tab content to `@/components/sora-ui/...`.

## What `registry:build` does

1. Merges `registry-item.json` files into `public/r/registry.json` (only items referenced in docs, UI, or catalog MDX).
2. Generates `__registry__/index.tsx` (preview + code for the docs app).
3. For each documented primitive with `demoProps` and **no** `demo-*` folder on disk → synthesizes a `demo-<name>` entry (`component: null`, `files[].content` only).
4. Runs `shadcn build` → JSON artifacts under `public/r/*.json`.

## Example: `text-effect`

| File | Role |
|------|------|
| `registry/primitives/texts/text-effect/index.tsx` | Component source |
| `registry/primitives/texts/text-effect/registry-item.json` | Registry metadata + `demoProps` |
| `registry/demo/primitives/texts/text-effect/index.tsx` | Manual docs preview demo |
| `content/docs/primitives/text-effect.mdx` | `<ComponentPreview name="demo-text-effect" />` |
| `content/docs/primitives/meta.json` | Sidebar (`root: true`, `pages`) |

## Inspiration attribution

When a component borrows from an external motion library or site, document it in **two places**:

1. **`meta.inspiration`** on the primitive `registry-item.json`
2. A **`## Credits`** section at the bottom of the component MDX page (after Props), using `<ComponentCredits name="<name>" />`

Use one of two `type` values — copy is generated automatically:

| Situation | `meta.inspiration.type` | Rendered text |
|-----------|-------------------------|---------------|
| UX / animation idea only | `"inspired"` | Inspired by [Source](url). |
| Full rewrite in Motion + React | `"reimplemented"` | Inspired by [Source](url). Reimplemented for Motion and React. |

```mdx
## Credits

<ComponentCredits name="text-reveal-mask" />
```

```json
"meta": {
  "inspiration": {
    "type": "reimplemented",
    "label": "Annnimate",
    "url": "https://www.annnimate.com"
  }
}
```

Skip `inspiration` for components that are fully original.

## Commands

```bash
cd apps/www
bun run registry:build   # after changing registry or demoProps
bun dev                  # run the docs site
```

## See also

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — broader guide (icons, components, tweakpane field types)
- [shadcn registry item schema](https://ui.shadcn.com/docs/registry/registry-item-json)
