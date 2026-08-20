import {
  type InferMetaType,
  type InferPageType,
  loader,
} from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { ui } from "@/.source";
import { attachFile } from "@/lib/docs/attach-file";
import { attachSeparator } from "@/lib/docs/attach-separator";

export const uiSource = loader({
  baseUrl: "/ui",
  source: ui.toFumadocsSource(),
  pageTree: {
    attachFile,
    attachSeparator,
  },
  icon(icon) {
    if (!icon) {
      return;
    }
    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }
  },
});

export type UiPage = InferPageType<typeof uiSource>;
export type UiMeta = InferMetaType<typeof uiSource>;
