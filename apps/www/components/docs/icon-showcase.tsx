import type { IconProps } from '@/registry/icons/icon';
import React from 'react';

export type IconShowcaseProps = {
  icon: React.ComponentType<IconProps<string>>;
  displayTitle?: boolean;
} & IconProps<string>;

export const IconShowcase = ({
  icon: Icon,
  displayTitle = true,
  ...props
}: IconShowcaseProps) => {
  return (
    <div className="bg-muted/50 relative mx-auto flex aspect-square h-[200px] w-full max-w-[250px] items-center justify-center rounded-2xl border lg:w-[250px]">
      {props.animation && displayTitle ? (
        <p className="bg-border text-muted-foreground absolute -top-4.5 left-1/2 -translate-x-1/2 rounded-b-lg px-3 py-1.5 text-sm whitespace-nowrap">
          {props.animation}
        </p>
      ) : null}
      <Icon animate className="size-[100px] text-current" {...props} />
    </div>
  );
};
