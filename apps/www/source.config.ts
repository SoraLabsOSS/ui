import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import remarkReadingTime from "remark-reading-time";
import { z } from "zod/v4";

import { gitLastModifiedForFile } from "./lib/docs/git-last-modified";

const compositionRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  components: z.array(z.string()).min(1),
  constraints: z.array(z.string()).default([]),
});

const blocksDocSchema = frontmatterSchema.extend({
  /** Overrides git `lastModified` for the 10-day "new" badge only. */
  releaseDate: z.coerce.date().optional(),
  beta: z.boolean().optional(),
  alpha: z.boolean().optional(),
  updated: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  author: z
    .object({
      name: z.string(),
      url: z.string().optional(),
    })
    .optional(),
  /** Registry item name when it differs from the MDX slug. */
  registryName: z.string().optional(),
  /** Registry preview entry override (e.g. demo-*). */
  preview: z.string().optional(),
  /** Gallery card poster + hover video preview assets. */
  cardPreview: z
    .object({
      poster: z.string().optional(),
      videoWebm: z.string().optional(),
      videoMp4: z.string().optional(),
    })
    .optional(),
  /** @deprecated Use `cardPreview.videoMp4`. */
  previewVideo: z.string().optional(),
});

const uiDocSchema = blocksDocSchema.extend({
  /** Machine-readable composition semantics for agent tooling. */
  intent: z.string().optional(),
  role: z.string().optional(),
  a11yConstraints: z.array(z.string()).optional(),
  motionEngine: z.string().optional(),
  compositionRules: z.array(z.string()).optional(),
  compositionRecipes: z.array(compositionRecipeSchema).optional(),
});

const blocksDocPostprocess = {
  includeProcessedMarkdown: true,
} as const;

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: blocksDocSchema,
    postprocess: blocksDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

/** Base UI + Motion kit — served at `/ui/*`. */
export const ui = defineDocs({
  dir: "content/ui",
  docs: {
    schema: uiDocSchema,
    postprocess: blocksDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

/** Blocks pages — served at `/blocks/*`, not under `/docs`. */
export const blocks = defineDocs({
  dir: "content/blocks",
  docs: {
    schema: blocksDocSchema,
    postprocess: blocksDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

/** @deprecated Alias for backwards compatibility with legacy imports. */
export const components = blocks;

/** Animated Icons docs — served at `/icons/*`. */
export const icons = defineDocs({
  dir: "content/icons",
  docs: {
    schema: blocksDocSchema,
    postprocess: blocksDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

/** Motion primitives — served at `/motion/*`. */
export const motion = defineDocs({
  dir: "content/motion",
  docs: {
    schema: blocksDocSchema,
    postprocess: blocksDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

/**
 * `valueToExport` alone only injects the export into the compiled MDX
 * module — the runtime loader still needs `doc.passthroughs` to forward it
 * onto `page.data` (see how the built-in `lastModified` plugin does this).
 */
const readingTimePassthrough = {
  name: "reading-time-passthrough",
  "index-file": {
    serverOptions(options: { doc?: { passthroughs?: string[] } }) {
      options.doc ??= {};
      options.doc.passthroughs ??= [];
      options.doc.passthroughs.push("readingTime");
    },
  },
};

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [...v, remarkReadingTime],
    // remarkStructure writes to vfile.data; export it for search indexing.
    valueToExport: ["structuredData"],
  },
  plugins: [
    lastModified({ versionControl: gitLastModifiedForFile }),
    readingTimePassthrough,
  ],
});
