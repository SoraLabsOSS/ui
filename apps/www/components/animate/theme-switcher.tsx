"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { setThemeWithTransition } from "@/lib/theme/set-theme-with-transition";
import { Switch } from "@/registry/ui/base/switch";

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { resolvedTheme: theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleThemeChange = useCallback(
    (checked: boolean) => {
      setThemeWithTransition(setTheme, checked ? "dark" : "light");
    },
    [setTheme]
  );

  return (
    isClient && (
      <Switch
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        checked={theme === "dark"}
        checkedIcon={<Moon className="size-3 text-primary-foreground" />}
        className={className}
        onCheckedChange={handleThemeChange}
        uncheckedIcon={<Sun className="size-3 text-muted-foreground" />}
      />
    )
  );
};
