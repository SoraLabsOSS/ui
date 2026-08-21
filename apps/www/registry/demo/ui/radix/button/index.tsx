"use client";

import { Button, type ButtonProps } from "@/registry/ui/radix/button";

export default function RadixButtonDemo({
  children = "Button",
  ...props
}: ButtonProps) {
  return <Button {...props}>{children}</Button>;
}
