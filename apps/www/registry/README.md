# Registry & docs flow

How to add and maintain components on the docs site (`apps/www`). Build script: [`scripts/build-registry.mts`](../scripts/build-registry.mts).

## Sora UI Taxonomy

Sora UI is organized into three distinct product tiers:

```text
Sora UI
├── Primitives   (Animation building blocks: border-trail, highlight, text-effect, auto-height)
├── Components   (Ready-to-use animated components & layouts: sticky-scroll-cards, cursor-trail-reveal)
└── UI           (Base UI + Radix UI foundation infused with Sora Motion & Tailwind CSS)
```

---

## Minimal flow by tier

### 1. UI Components (`/ui` — Base UI & Radix UI + Motion)

For accessible app & form primitives powered by `@base-ui/react` or `radix-ui` + `motion/react`:

```text
1. registry/ui/{base|radix}/<name>/
      index.tsx
      registry-item.json

2. registry/demo/ui/{base|radix}/<name>/index.tsx  ← rich multi-variant showcase (optional/recommended)

3. content/ui/<name>.mdx
      <ComponentPreview name="<name>" />
      <ComponentInstallation name="<name>" />

4. content/ui/meta.json   ← add to UI sidebar sections

5. bun run registry:build
```

### 2. Primitives (`/docs/primitives` — Animation building blocks)

For unstyled animation primitives (effects, text reveals, buttons, disclosure):

```text
1. registry/primitives/<category>/<name>/
      index.tsx
      registry-item.json    ← meta.demoProps (Tweakpane + auto Code tab)

2. content/docs/primitives/<name>.mdx
      <ComponentPreview name="<name>" />
      <ComponentInstallation name="<name>" />

3. content/docs/primitives/meta.json   ← add to docs sidebar under section

4. bun run registry:build
```

### 3. Components Catalog (`/components` — Ready-to-use layouts)

For full-page layout showcases documenting existing primitives:

```text
1. content/components/<slug>.mdx   ← showcases underlying registry primitive
2. content/components/meta.json    ← catalog navigation
3. bun run registry:build
```

---

## On the docs site

| Part | Source | Notes |
|------|--------|-------|
| **Preview** | `ComponentPreview name="<name>"` | Loads primitive from `@/registry/...`, props from `meta.demoProps` or manual `demo-*` |
| **Tweakpane** | `meta.demoProps` on the primitive `registry-item.json` | Top-level key = React export name (e.g. `TextEffect`) |
| **Code** | Auto-generated `demo-<name>` at build time (or manual demo on disk); **updates live** when Tweakpane changes | Snippet uses `@/components/sora-ui/...` (post–`shadcn add` paths) |
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

Add `registry/demo/{ui|primitives}/...` when:

- The example uses multiple components
- Layout, interactive cards, or demo logic cannot be expressed via `demoProps` alone

Structure:

```text
registry/demo/ui/base/checkbox/
  index.tsx              ← import from @/registry/... (runs in the monorepo)
  registry-item.json     ← registryDependencies: ["checkbox"]
```

- A demo folder on disk **overrides** the auto-generated Code tab snippet.
- In `index.tsx`, use `@/registry/...`, not `@/components/sora-ui/...` (install paths exist only after the user runs `shadcn add`).
- `registry:build` still transforms the **displayed** Code tab content to `@/components/sora-ui/...`.

## What `registry:build` does

1. Merges `registry-item.json` files into `public/r/registry.json` (only items referenced in docs, UI, or catalog MDX).
2. Generates `__registry__/index.tsx` (preview + code for the docs app).
3. For each documented primitive with `demoProps` and **no** `demo-*` folder on disk → synthesizes a `demo-<name>` entry (`component: null`, `files[].content` only).
4. Runs `shadcn build` → JSON artifacts under `public/r/*.json`.

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

<ComponentCredits name="checkbox" />
```

```json
"meta": {
  "inspiration": {
    "type": "reimplemented",
    "label": "Base UI: Checkbox (Motion Examples)",
    "url": "https://examples.motion.dev/react/base-checkbox"
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

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — broader guide (taxonomy, setup, PR workflows)
- [shadcn registry item schema](https://ui.shadcn.com/docs/registry/registry-item-json)
