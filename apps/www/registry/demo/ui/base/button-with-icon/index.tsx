"use client";

import { ChevronRight, Mail } from "lucide-react";
import { Button } from "@/registry/ui/base/button";

export default function ButtonWithIconDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Mail className="size-4" />
        Login with Email
      </Button>
      <Button variant="secondary">
        Next Step
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
