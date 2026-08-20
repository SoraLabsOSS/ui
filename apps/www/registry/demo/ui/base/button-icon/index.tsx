"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/registry/ui/base/button";

export default function ButtonIconDemo() {
  return (
    <Button aria-label="Next" size="icon" variant="outline">
      <ChevronRight className="size-4" />
    </Button>
  );
}
