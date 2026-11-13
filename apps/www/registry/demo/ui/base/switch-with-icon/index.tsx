"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

import { Switch } from "@/registry/ui/base/switch";

export default function SwitchWithIconDemo() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <Switch
        checked={isDark}
        checkedIcon={<Moon className="text-primary-foreground size-3" />}
        description="Toggle between light and dark visual aesthetics."
        label="Theme Mode"
        onCheckedChange={setIsDark}
        uncheckedIcon={<Sun className="text-muted-foreground size-3" />}
      />
    </div>
  );
}
