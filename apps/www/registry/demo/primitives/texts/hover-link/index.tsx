import {
  HoverLink,
  type HoverLinkVariant,
} from "@/registry/primitives/texts/hover-link";

const PREVIEW_LINKS: HoverLinkVariant[] = [
  "underline-left",
  "underline-right",
  "underline-center",
  "highlight-rise",
  "highlight-wipe",
];

export function HoverLinkDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-5 p-10">
      {PREVIEW_LINKS.map((variant) => (
        <HoverLink href="#hover-link" key={variant} variant={variant}>
          hello@soralabs.studio
        </HoverLink>
      ))}
    </div>
  );
}
