"use client";

import { Input } from "@/registry/ui/radix/input";

export default function RadixInputRtlDemo() {
  return (
    <div className="w-full max-w-md space-y-2 p-6" dir="rtl">
      <label className="block font-medium text-sm" htmlFor="radix-rtl-input">
        الاسم الكامل
      </label>
      <Input id="radix-rtl-input" placeholder="اكتب اسمك" />
    </div>
  );
}
