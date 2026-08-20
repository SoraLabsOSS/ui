"use client";

import { Button } from "@/registry/ui/base/button";

export default function ButtonSizesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra Small (xs)</Button>
      <Button size="sm">Small (sm)</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large (lg)</Button>
    </div>
  );
}
