"use client";

import { Button } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";
import { Fullscreen, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Iframe from "./iframe";

interface ComponentWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  bigScreen?: boolean;
  iframe?: boolean;
  name: string;
  /** Bumps when demo props change so the preview remounts and replays. */
  previewKey?: number;
}

export const ComponentWrapper = ({
  className,
  children,
  name,
  iframe = false,
  bigScreen = false,
  previewKey = 0,
}: ComponentWrapperProps) => {
  const [resetKey, setResetKey] = useState(0);
  const remountKey = `${resetKey}-${previewKey}`;

  return (
    <div className="rounded-xl bg-accent p-1.5">
      <div
        className={cn(
          "relative rounded-md bg-background",
          bigScreen && "overflow-hidden",
          className
        )}
        id="component-wrapper"
      >
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
          </div>
        )}

        {iframe ? (
          <Iframe bigScreen={bigScreen} key={remountKey} name={name} />
        ) : (
          <div
            className="flex min-h-[400px] w-full items-center justify-center px-10 py-16"
            key={remountKey}
            onClickCapture={(event) => {
              const anchor = (event.target as HTMLElement).closest("a[href]");
              if (anchor) {
                event.preventDefault();
              }
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
