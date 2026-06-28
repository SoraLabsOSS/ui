/// <reference types="bun" />

import { createMdxPlugin } from "fumadocs-mdx/bun";

/** biome-ignore lint/correctness/noUndeclaredVariables: Bun preload plugin API */
Bun.plugin(createMdxPlugin());
