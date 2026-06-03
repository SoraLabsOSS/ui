import type React from "react";
import type { IconProps } from "@/registry/icons/icon";

export type IconShowcaseProps = {
  icon: React.ComponentType<IconProps<string>>;
  displayTitle?: boolean;
} & IconProps<string>;

export const IconShowcase = ({
  icon: Icon,
  displayTitle = true,
  ...props
}: IconShowcaseProps) => (
  <div className="relative mx-auto flex aspect-square h-[200px] w-full max-w-[250px] items-center justify-center rounded-2xl border bg-muted/50 lg:w-[250px]">
    {props.animation && displayTitle ? (
      <p className="absolute -top-4.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-b-lg bg-border px-3 py-1.5 text-muted-foreground text-sm">
        {props.animation}
      </p>
    ) : null}
    <Icon animate className="size-[100px] text-current" {...props} />
  </div>
);
