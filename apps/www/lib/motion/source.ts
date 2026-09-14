import {
  type InferMetaType,
  type InferPageType,
  loader,
} from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { motion } from "@/.source";
import { attachFile } from "@/lib/docs/attach-file";
import { attachSeparator } from "@/lib/docs/attach-separator";

export const motionSource = loader({
  baseUrl: "/motion",
  source: motion.toFumadocsSource(),
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

export type MotionPage = InferPageType<typeof motionSource>;
export type MotionMeta = InferMetaType<typeof motionSource>;
