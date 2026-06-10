"use client";

import { cn } from "@workspace/ui/lib/utils";
import { catalogPreviewScreenClassName } from "@/components/catalog/catalog-preview-classes";
import {
  DrawUnderlineLink,
  type DrawUnderlineLinkProps,
} from "@/registry/primitives/texts/draw-underline-link";

export default function DrawUnderlineLinkCatalogDemo({
  label = "Hover me",
  variant = "default",
  duration = 0.5,
  underlineColor = "#ff4c24",
  ...props
}: DrawUnderlineLinkProps) {
  const sectionClassName = cn(
    "flex items-center justify-center",
    catalogPreviewScreenClassName
  );

  return (
    <>
      <section className={sectionClassName}>
        <DrawUnderlineLink
          duration={duration}
          href="#"
          label={label}
          underlineColor={underlineColor}
          variant={variant}
          {...props}
        />
      </section>
      <section className={sectionClassName}>
        <DrawUnderlineLink
          duration={duration}
          href="#"
          label="Keep scrolling"
          underlineColor={underlineColor}
          variant={variant}
          {...props}
        />
      </section>
    </>
  );
}
