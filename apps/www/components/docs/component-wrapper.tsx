"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import type * as React from "react";
import Iframe from "./iframe";

interface ComponentWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  bigScreen?: boolean;
  iframe?: boolean;
  name: string;
  previewKey?: number;
}

export const ComponentWrapper = ({
  className,
  children,
  name,
  iframe = false,
  bigScreen = false,
  previewKey = 0,
}: ComponentWrapperProps) => (
  <div className="rounded-none p-1.5">
    <motion.div
      className={cn(
        "relative flex max-w-screen flex-col rounded-md bg-background md:flex-row",
        bigScreen && "overflow-hidden",
        className
      )}
      id="component-wrapper"
    >
      <motion.div className="relative size-full flex-1">
        {iframe ? (
          <Iframe bigScreen={bigScreen} key={previewKey} name={name} />
        ) : (
          <div
            className="flex min-h-[400px] w-full items-center justify-center px-6 py-12 sm:px-10 sm:py-16"
            key={previewKey}
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
      </motion.div>
    </motion.div>
  </div>
);
