import { type InferPageType, loader } from "fumadocs-core/source";
import { components } from "@/.source";

export const componentSource = loader({
  baseUrl: "/components",
  source: components.toFumadocsSource(),
});

export type ComponentDocPage = InferPageType<typeof componentSource>;
