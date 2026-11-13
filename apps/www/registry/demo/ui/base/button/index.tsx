"use client";

import { Button } from "@/registry/ui/base/button";
import type { ButtonProps } from "@/registry/ui/base/button";

export default function ButtonDemo({
  children = "Button",
  ...props
}: ButtonProps) {
  return <Button {...props}>{children}</Button>;
}
