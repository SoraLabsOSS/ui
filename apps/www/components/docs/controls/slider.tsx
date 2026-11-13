"use client";

import { Slider } from "dialkit";
import type { ComponentProps } from "react";

export type ControlSliderProps = ComponentProps<typeof Slider> & {
  className?: string;
};

export const ControlSlider = ({ className, ...props }: ControlSliderProps) => {
  if (className) {
    return (
      <div className={className}>
        <Slider {...props} />
      </div>
    );
  }
  return <Slider {...props} />;
};
