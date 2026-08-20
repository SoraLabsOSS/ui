"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/registry/ui/base/button";

export default function ButtonLoadingDemo() {
  return (
    <Button disabled>
      <Loader2 className="size-4 animate-spin" />
      Please wait
    </Button>
  );
}
