"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Switch } from "@/components/radix/switch";
import { setThemeWithTransition } from "@/lib/theme/set-theme-with-transition";

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
        checked={theme === "dark"}
        className={className}
        leftIcon={<Sun />}
        onCheckedChange={handleThemeChange}
        rightIcon={<Moon />}
      />
    )
  );
};
