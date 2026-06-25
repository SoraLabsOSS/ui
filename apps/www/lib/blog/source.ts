import { type InferPageType, loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { blog as blogCollection } from "@/.source";

export const blog = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blogCollection, []),
});

export type BlogPage = InferPageType<typeof blog>;
