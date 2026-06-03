"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/radix/switch";

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { resolvedTheme: theme, setTheme } = useTheme();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient && (
      <Switch
        checked={theme === "dark"}
        className={className}
        leftIcon={<Sun />}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        rightIcon={<Moon />}
      />
    )
  );
};
