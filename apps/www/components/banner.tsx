"use client";

import { cn } from "@workspace/ui/lib/utils";
import { X } from "lucide-react";
import { type HTMLAttributes, useEffect, useState } from "react";
import { getBannerDismissClass } from "@/lib/banner-config";
import { buttonVariants } from "./ui/button";

type BannerVariant = "rainbow" | "normal";

export function Banner({
  id,
  variant = "normal",
  changeLayout = true,
  height = "3rem",
  rainbowColors = [
    "rgba(0,149,255,0.56)",
    "rgba(231,77,255,0.77)",
    "rgba(255,0,0,0.73)",
    "rgba(131,255,166,0.66)",
  ],
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * @defaultValue 3rem
   */
  height?: string;

  /**
   * @defaultValue 'normal'
   */
  variant?: BannerVariant;

  /**
   * For rainbow variant only, customize the colors
   */
  rainbowColors?: string[];

  /**
   * Change Fumadocs layout styles
   *
   * @defaultValue true
   */
  changeLayout?: boolean;
}) {
  const globalKey = id ? getBannerDismissClass(id) : null;
  const [open, setOpen] = useState(() => {
    if (!globalKey || typeof window === "undefined") {
      return true;
    }

    return localStorage.getItem(globalKey) !== "true";
  });

  useEffect(() => {
    if (!globalKey) {
      return;
    }

    if (localStorage.getItem(globalKey) !== "true") {
      return;
    }

    document.documentElement.classList.add(globalKey);
    document.documentElement.style.setProperty("--fd-banner-height", "0px");
    setOpen(false);
  }, [globalKey]);

  function onClose() {
    setOpen(false);

    if (globalKey) {
      localStorage.setItem(globalKey, "true");
      document.documentElement.classList.add(globalKey);
      document.documentElement.style.setProperty("--fd-banner-height", "0px");
    }
  }

  if (!open) {
    return null;
  }

  const bannerHeightStyle = { height };

  return (
    <>
      <div
        id={id}
        {...props}
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex shrink-0 flex-row items-center justify-center px-4 text-center font-medium text-sm",
          variant === "normal" && "bg-background",
          variant === "rainbow" && "bg-background",
          props.className
        )}
        style={bannerHeightStyle}
      >
        {changeLayout && open ? (
          <style>
            {globalKey
              ? `:root:not(.${globalKey}) { --fd-banner-height: ${height}; }`
              : `:root { --fd-banner-height: ${height}; }`}
          </style>
        ) : null}

        {variant === "rainbow"
          ? flow({
              colors: rainbowColors,
            })
          : null}
        {props.children}
        {id ? (
          <button
            aria-label="Close Banner"
            className={cn(
              buttonVariants({
                color: "ghost",
                className:
                  "absolute inset-e-2 top-1/2 -translate-y-1/2 text-fd-muted-foreground/50",
                size: "icon-sm",
              })
            )}
            onClick={onClose}
            type="button"
          >
            <X />
          </button>
        ) : null}
      </div>
      {changeLayout ? (
        <div aria-hidden className="shrink-0" style={bannerHeightStyle} />
      ) : null}
    </>
  );
}

const maskImage =
  "linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)";

function flow({ colors }: { colors: string[] }) {
  return (
    <>
      <div
        className="absolute inset-0 -z-1"
        style={{
          maskImage,
          maskComposite: "intersect",
          animation: "fd-moving-banner 20s linear infinite",
          backgroundImage: `repeating-linear-gradient(70deg, ${[...colors, colors[0]].map((color, i) => `${color} ${(i * 50) / colors.length}%`).join(", ")})`,
          backgroundSize: "200% 100%",
          filter: "saturate(2)",
        }}
      />
      <style>
        {`@keyframes fd-moving-banner {
            from { background-position: 0% 0;  }
            to { background-position: 100% 0;  }
         }`}
      </style>
    </>
  );
}
