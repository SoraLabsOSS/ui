import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import { z } from "zod/v4";

const catalogDocSchema = frontmatterSchema.extend({
  /** Overrides git `lastModified` for the 30-day "new" badge only. */
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
});

const catalogDocPostprocess = {
  includeProcessedMarkdown: true,
} as const;

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: catalogDocSchema,
    postprocess: catalogDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

/** Catalog component pages — served at `/components/*`, not under `/docs`. */
export const components = defineDocs({
  dir: "content/components",
  docs: {
    schema: catalogDocSchema,
    postprocess: catalogDocPostprocess,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {},
  plugins: [lastModified()],
});
