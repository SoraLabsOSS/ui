"use client";

import { useState } from "react";
import { Checkbox } from "@/registry/ui/radix/checkbox";

export default function RadixCheckboxCardDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex items-center justify-center p-4">
      <label
        className="flex max-w-md cursor-pointer items-start gap-3.5 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40 has-data-checked:border-primary has-data-checked:bg-primary/5"
        htmlFor="radix-security-card-input"
      >
        <Checkbox
          checked={enabled}
          id="radix-security-card-input"
          onCheckedChange={(val) => setEnabled(Boolean(val))}
        />
        <div className="grid gap-1">
          <span className="font-medium text-foreground text-sm leading-none">
            Two-factor Authentication
          </span>
          <span className="text-muted-foreground text-xs leading-normal">
            Protect your account with an extra layer of security on login.
          </span>
        </div>
      </label>
    </div>
  );
}
