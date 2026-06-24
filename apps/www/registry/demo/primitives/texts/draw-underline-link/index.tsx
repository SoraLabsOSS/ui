"use client";
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
  return (
    <section>
      <DrawUnderlineLink
        duration={duration}
        href="#"
        label={label}
        underlineColor={underlineColor}
        variant={variant}
        {...props}
      />
    </section>
  );
}
