"use client";

import { Checkbox } from "@/registry/ui/radix/checkbox";

export default function RadixCheckboxWithTextDemo() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex max-w-sm items-start gap-3">
        <Checkbox defaultChecked id="radix-terms-with-text" />
        <div className="grid gap-1.5 leading-none">
          <label
            className="cursor-pointer select-none font-medium text-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="radix-terms-with-text"
          >
            Accept terms and conditions
          </label>
          <p className="text-muted-foreground text-xs">
            By clicking this checkbox, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
