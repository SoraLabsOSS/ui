"use client";

import { Checkbox } from "@/registry/ui/base/checkbox";

export default function CheckboxCustomDemo() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Emerald Medium */}
        <div className="flex items-center gap-2.5">
          <Checkbox
            className="size-5 rounded-md data-checked:border-emerald-600 data-checked:bg-emerald-600 dark:data-checked:border-emerald-500 dark:data-checked:bg-emerald-500"
            defaultChecked
            id="custom-emerald-box"
            indicatorClassName="size-4"
          />
          <label
            className="cursor-pointer select-none font-medium text-sm"
            htmlFor="custom-emerald-box"
          >
            Emerald Medium
          </label>
        </div>

        {/* Circular Pill */}
        <div className="flex items-center gap-2.5">
          <Checkbox
            className="size-5 rounded-full data-checked:border-violet-600 data-checked:bg-violet-600 dark:data-checked:border-violet-500 dark:data-checked:bg-violet-500"
            defaultChecked
            id="custom-pill-box"
            indicatorClassName="size-3.5"
          />
          <label
            className="cursor-pointer select-none font-medium text-sm"
            htmlFor="custom-pill-box"
          >
            Circular Pill
          </label>
        </div>

        {/* Large Hero Checkbox */}
        <div className="flex items-center gap-3">
          <Checkbox
            className="size-7 rounded-lg"
            defaultChecked
            id="custom-large-box"
            indicatorClassName="size-5"
          />
          <label
            className="cursor-pointer select-none font-medium text-sm"
            htmlFor="custom-large-box"
          >
            Large (size-7)
          </label>
        </div>
      </div>
    </div>
  );
}
