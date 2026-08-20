"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/registry/ui/radix/button";

export default function RadixButtonIconDemo() {
  return (
    <Button aria-label="Next" size="icon" variant="outline">
      <ChevronRight className="size-4" />
    </Button>
  );
}
