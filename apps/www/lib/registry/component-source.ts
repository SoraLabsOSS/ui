import { loader } from "fumadocs-core/source";
import type { InferPageType } from "fumadocs-core/source";

import { blocks } from "@/.source";

export const componentSource = loader({
  baseUrl: "/blocks",
  source: blocks.toFumadocsSource(),
});

export const blocksSource = componentSource;

export type ComponentDocPage = InferPageType<typeof componentSource>;
export type BlocksDocPage = InferPageType<typeof componentSource>;
