"use client";

import { Switch } from "@/registry/ui/radix/switch";
import type { SwitchProps } from "@/registry/ui/radix/switch";

export default function SwitchDemo({
  label = "Airplane Mode",
  ...props
}: SwitchProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Switch label={label} {...props} />
    </div>
  );
}
