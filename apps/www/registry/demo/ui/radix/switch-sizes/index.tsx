"use client";

import { Switch } from "@/registry/ui/radix/switch";

export default function SwitchSizesDemo() {
  return (
    <div className="flex flex-col items-start gap-4 p-4">
      <Switch defaultChecked label="Small Switch" size="sm" />
      <Switch defaultChecked label="Default Switch" size="default" />
      <Switch defaultChecked label="Large Switch" size="lg" />
    </div>
  );
}
