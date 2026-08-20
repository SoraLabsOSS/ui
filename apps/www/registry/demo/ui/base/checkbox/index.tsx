"use client";

import { Checkbox } from "@/registry/ui/base/checkbox";

export default function CheckboxDemo() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-2">
        <Checkbox id="terms-default" />
        <label
          className="cursor-pointer select-none font-medium text-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms-default"
        >
          Accept terms and conditions
        </label>
      </div>
    </div>
  );
}
