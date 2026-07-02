import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import remarkReadingTime from "remark-reading-time";
import { z } from "zod/v4";
import { gitLastModifiedForFile } from "./lib/docs/git-last-modified";

const catalogDocSchema = frontmatterSchema.extend({
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

/** Blog posts — served at `/blog/*`. */
export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    author: z.string(),
    date: z.iso.date().or(z.date()),
    image: z.string().optional(),
    hashtags: z.array(z.string().startsWith("#")).optional(),
    flags: z.array(z.string()).optional(),
    subpage: z.boolean().optional(),
    hidden: z.boolean().optional(),
  }),
  postprocess: {
    includeProcessedMarkdown: true,
    // remark-reading-time writes to vfile.data; per-collection postprocess is
    // what actually reaches remarkPostprocess — the global mdxOptions one doesn't.
    valueToExport: ["readingTime"],
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
