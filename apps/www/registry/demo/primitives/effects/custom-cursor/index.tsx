"use client";

import { IconLogo } from "@/components/icon-logo";
import {
  CustomCursor,
  type CustomCursorProps,
  CustomCursorTarget,
} from "@/registry/primitives/effects/custom-cursor";

export function CustomCursorExample({
  className,
  color = "#ff4c24",
  followDamping = 22,
  followStiffness = 150,
}: CustomCursorProps) {
  return (
    <CustomCursor
      className={className}
      color={color}
      followDamping={followDamping}
      followStiffness={followStiffness}
      layout="demo"
    >
      <CustomCursorTarget aria-label="Sora logo" size="lg">
        <IconLogo className="size-full" />
      </CustomCursorTarget>
    </CustomCursor>
  );
}
