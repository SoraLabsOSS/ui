import {
  type InferMetaType,
  type InferPageType,
  loader,
} from "fumadocs-core/source";
import { icons as lucideIcons } from "lucide-react";
import { createElement } from "react";
import { icons } from "@/.source";
import { attachFile } from "@/lib/docs/attach-file";
import { attachSeparator } from "@/lib/docs/attach-separator";

export const iconsSource = loader({
  baseUrl: "/icons",
  source: icons.toFumadocsSource(),
  pageTree: {
    attachFile,
    attachSeparator,
  },
  icon(icon) {
    if (!icon) {
      return;
    }
    if (icon in lucideIcons) {
      return createElement(lucideIcons[icon as keyof typeof lucideIcons]);
    }
  },
});

export type IconDocPage = InferPageType<typeof iconsSource>;
export type IconDocMeta = InferMetaType<typeof iconsSource>;
