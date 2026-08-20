"use client";

import { Checkbox } from "@/registry/ui/base/checkbox";

export default function CheckboxDisabledDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="flex items-center gap-2">
        <Checkbox disabled id="disabled-unchecked" />
        <label
          className="cursor-not-allowed select-none text-muted-foreground text-sm leading-none opacity-50"
          htmlFor="disabled-unchecked"
        >
          Disabled option (unchecked)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked disabled id="disabled-checked" />
        <label
          className="cursor-not-allowed select-none text-muted-foreground text-sm leading-none opacity-50"
          htmlFor="disabled-checked"
        >
          Disabled option (checked)
        </label>
      </div>
    </div>
  );
}
