"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

export interface ControlToggleProps {
  className?: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}

export const ControlToggle = ({
  label,
  value,
  onChange,
  className,
}: ControlToggleProps) => {
  const layoutId = useId();
  const shouldReduceMotion = useReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "Home") {
      e.preventDefault();
      onChange(false);
    } else if (
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "End"
    ) {
      e.preventDefault();
      onChange(true);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!value);
    }
  };

  return (
    <div
      className={cn(
        "dialkit-labeled-control flex h-[38px] w-full items-center justify-between rounded-[var(--dial-radius,8px)] bg-[var(--dial-surface)] px-3 text-[13px]",
        className
      )}
    >
      <span className="dialkit-labeled-control-label font-medium text-[var(--dial-text-label)] select-none">
        {label}
      </span>

      <div
        className="dialkit-segmented relative inline-flex h-[34px] items-center rounded-[8px] bg-black/[0.05] p-[2px] select-none dark:bg-white/[0.06]"
        onKeyDown={handleKeyDown}
        role="radiogroup"
        tabIndex={0}
      >
        <button
          aria-checked={!value}
          className={cn(
            "dialkit-segmented-button relative z-10 flex h-[30px] min-w-[48px] cursor-pointer items-center justify-center rounded-[6px] px-3.5 text-[13px] leading-none font-medium transition-colors select-none",
            value
              ? "text-[var(--dial-text-label)] hover:text-[var(--dial-text-primary)]"
              : "text-[var(--dial-text-primary)]"
          )}
          onClick={() => onChange(false)}
          role="radio"
          tabIndex={-1}
          type="button"
        >
          {value ? null : (
            <motion.div
              className="dialkit-segmented-pill absolute inset-0 rounded-[6px] bg-black/12 shadow-xs dark:bg-white/16"
              layoutId={`toggle-pill-${layoutId}`}
              style={{ zIndex: -1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 35 }
              }
            />
          )}
          Off
        </button>

        <button
          aria-checked={value}
          className={cn(
            "dialkit-segmented-button relative z-10 flex h-[30px] min-w-[48px] cursor-pointer items-center justify-center rounded-[6px] px-3.5 text-[13px] leading-none font-medium transition-colors select-none",
            value
              ? "text-[var(--dial-text-primary)]"
              : "text-[var(--dial-text-label)] hover:text-[var(--dial-text-primary)]"
          )}
          onClick={() => onChange(true)}
          role="radio"
          tabIndex={-1}
          type="button"
        >
          {value ? (
            <motion.div
              className="dialkit-segmented-pill absolute inset-0 rounded-[6px] bg-black/12 shadow-xs dark:bg-white/16"
              layoutId={`toggle-pill-${layoutId}`}
              style={{ zIndex: -1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 35 }
              }
            />
          ) : null}
          On
        </button>
      </div>
    </div>
  );
};
