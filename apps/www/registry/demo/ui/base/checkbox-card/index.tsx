"use client";

import { useState } from "react";

import { Checkbox } from "@/registry/ui/base/checkbox";

export default function CheckboxCardDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex items-center justify-center p-4">
      <label
        className="border-border bg-card hover:bg-muted/40 has-data-checked:border-primary has-data-checked:bg-primary/5 flex max-w-md cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition-colors"
        htmlFor="security-card-input"
      >
        <Checkbox
          checked={enabled}
          id="security-card-input"
          onCheckedChange={setEnabled}
        />
        <div className="grid gap-1">
          <span className="text-foreground text-sm leading-none font-medium">
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
