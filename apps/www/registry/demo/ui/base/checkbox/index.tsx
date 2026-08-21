"use client";

import { Checkbox, type CheckboxProps } from "@/registry/ui/base/checkbox";

export default function CheckboxDemo({
  label = "Accept terms and conditions",
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Checkbox label={label} {...props} />
    </div>
  );
}
