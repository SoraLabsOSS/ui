"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Switch } from "@/components/radix/switch";

const svgMask = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="40" cy="0" r="18" fill="white" filter="url(%23blur)"/></svg>`;

const transitionStyles = `
  ::view-transition-group(root) {
    animation-duration: 1.5s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }

  ::view-transition-new(root) {
    mask: url('${svgMask}') top right / 0 no-repeat;
    -webkit-mask: url('${svgMask}') top right / 0 no-repeat;
    mask-origin: content-box;
    -webkit-mask-origin: content-box;
    animation: theme-reveal-scale 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform-origin: top right;
  }

  ::view-transition-old(root) {
    animation: none;
    z-index: -1;
  }

  @keyframes theme-reveal-scale {
    from {
      mask-size: 0;
    }
    to {
      mask-size: 350vmax;
    }
  }
`;

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { resolvedTheme: theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleThemeChange = useCallback(
    (checked: boolean) => {
      const nextTheme = checked ? "dark" : "light";

      if (typeof window === "undefined") {
        setTheme(nextTheme);
        return;
      }

      const doc = document as any;
      if (!doc.startViewTransition) {
        setTheme(nextTheme);
        return;
      }

      // Inject styles
      const styleId = "theme-transition-styles";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = transitionStyles;

      doc.startViewTransition(() => {
        setTheme(nextTheme);
      });
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
