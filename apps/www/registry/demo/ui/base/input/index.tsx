"use client";

import { Input } from "@/registry/ui/base/input";

export default function InputRtlDemo() {
  return (
    <div className="w-full max-w-md space-y-2 p-6" dir="rtl">
      <label className="block font-medium text-sm" htmlFor="base-rtl-input">
        الاسم الكامل
      </label>
      <Input id="base-rtl-input" placeholder="اكتب اسمك" />
    </div>
  );
}
