"use client";

import { Checkbox } from "@/registry/ui/radix/checkbox";
import type { CheckboxProps } from "@/registry/ui/radix/checkbox";

export default function RadixCheckboxDemo({
  label = "Accept terms and conditions",
  ...props
}: CheckboxProps) {
  return <Checkbox label={label} {...props} />;
}
