"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/registry/ui/radix/button";

export default function RadixButtonLoadingDemo() {
  return (
    <Button disabled>
      <Loader2 className="size-4 animate-spin" />
      Please wait
    </Button>
  );
}
