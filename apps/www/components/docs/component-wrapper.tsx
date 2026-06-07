"use client";

import { Button } from "@workspace/ui/components/ui/button";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import { Fullscreen, RotateCcw, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Iframe from "./iframe";

interface ComponentWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  bigScreen?: boolean;
  iframe?: boolean;
  name: string;
  /** Bumps when demo props change so the preview remounts and replays. */
  previewKey?: number;
  tweakpane?: React.ReactNode;
}

export const ComponentWrapper = ({
  className,
  children,
  name,
  iframe = false,
  bigScreen = false,
  previewKey = 0,
  tweakpane,
}: ComponentWrapperProps) => {
  const [tweakMode, setTweakMode] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const remountKey = `${resetKey}-${previewKey}`;

  const isMobile = useIsMobile();

  return (
    <div className="rounded-xl bg-accent p-1.5">
      <motion.div
        className={cn(
          "relative flex max-w-screen flex-col rounded-md bg-background md:flex-row",
          bigScreen && "overflow-hidden",
          className
        )}
        id="component-wrapper"
      >
        <motion.div className="relative size-full flex-1">
          {!iframe && (
            <div className="absolute top-3 right-3 z-[9] flex items-center justify-end gap-2 rounded-[11px] bg-background p-1">
              <Button
                asChild
                className="flex items-center rounded-lg"
                onClick={() => setResetKey((prev) => prev + 1)}
                size="icon-sm"
                variant="neutral"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw aria-label="restart-btn" size={14} />
                </motion.button>
              </Button>

              {iframe && (
                <Button
                  asChild
                  className="flex items-center rounded-lg"
                  onClick={() => window.open(`/examples/${name}`, "_blank")}
                  size="icon-sm"
                  variant="neutral"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Fullscreen aria-label="fullscreen-btn" size={14} />
                  </motion.button>
                </Button>
              )}

              {tweakpane && (
                <Button
                  asChild
                  className="flex items-center rounded-lg"
                  onClick={() => setTweakMode((prev) => !prev)}
                  size="icon-sm"
                  variant="neutral"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SlidersHorizontal aria-label="tweak-btn" size={14} />
                  </motion.button>
                </Button>
              )}
            </div>
          )}

          {iframe ? (
            <Iframe bigScreen={bigScreen} key={remountKey} name={name} />
          ) : (
            <div
              className="flex min-h-[400px] w-full items-center justify-center px-10 py-16"
              key={remountKey}
            >
              {children}
            </div>
          )}
        </motion.div>

        <motion.div
          animate={{
            width: isMobile ? "100%" : tweakMode ? "250px" : "0px",
            height: isMobile ? (tweakMode ? "250px" : "0px") : "auto",
            opacity: tweakMode ? 1 : 0,
          }}
          className="relative"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            restDelta: 0.01,
          }}
        >
          <div className="absolute inset-0 overflow-y-auto">{tweakpane}</div>
        </motion.div>
      </motion.div>
    </div>
  );
};
