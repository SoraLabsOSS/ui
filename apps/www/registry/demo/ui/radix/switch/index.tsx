"use client";

import { Switch, type SwitchProps } from "@/registry/ui/radix/switch";

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
