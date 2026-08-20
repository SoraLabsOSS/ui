import { type InferPageType, loader } from "fumadocs-core/source";
import { catalog } from "@/.source";

export const componentSource = loader({
  baseUrl: "/catalog",
  source: catalog.toFumadocsSource(),
});

export const catalogSource = componentSource;

export type ComponentDocPage = InferPageType<typeof componentSource>;
export type CatalogDocPage = ComponentDocPage;
