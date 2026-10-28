"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "@/registry/primitives/texts/text-morph";

const STATES = [
  {
    icon: (
      <svg
        aria-hidden="true"
        className="size-[23px] animate-spin [animation-duration:0.6s]"
        fill="none"
        height="23"
        viewBox="0 0 23 23"
        width="23"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.313 11.4062C21.313 16.8775 16.8777 21.3128 11.4065 21.3128"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M11.4065 21.313C16.8777 21.313 21.313 16.8777 21.313 11.4065C21.313 5.93529 16.8777 1.5 11.4065 1.5C5.93529 1.5 1.5 5.93529 1.5 11.4065C1.5 16.8777 5.93529 21.313 11.4065 21.313Z"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    ),
    id: "processing",
    label: "Processing Transaction",
  },
  {
    icon: (
      <svg
        aria-hidden="true"
        className="size-[21px]"
        fill="none"
        height="21"
        viewBox="0 0 21 21"
        width="21"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.9016 10.4508C20.9016 4.67899 16.2226 0 10.4508 0C4.67899 0 0 4.67899 0 10.4508C0 16.2226 4.67899 20.9016 10.4508 20.9016C16.2226 20.9016 20.9016 16.2226 20.9016 10.4508Z"
          fill="currentColor"
        />
        <path
          d="M6.09631 10.9828L8.83539 13.6439L14.8053 7.83789"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
          strokeWidth="2.5"
        />
      </svg>
    ),
    id: "safe",
    label: "Transaction Safe",
  },
] as const;

const ICON_TRANSITION = {
  damping: 80,
  mass: 4,
  restDelta: 0.0001,
  stiffness: 800,
  type: "spring" as const,
};

/**
 * Docs preview — transaction status pill with smooth layout morphing.
 */
export function TextMorphTransaction() {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const current = STATES[currentStateIndex] ?? STATES[0];

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentStateIndex((prev) => (prev + 1) % STATES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <div className="flex w-full items-center justify-center p-6">
      <div
        className={cn(
          "inline-flex items-center justify-center gap-2.5 overflow-hidden",
          "rounded-full bg-[#131313] py-3 pr-6 pl-4.5 font-medium text-base text-white",
          "border border-white/10 shadow-lg dark:border-white/[0.08]"
        )}
      >
        <div className="relative flex size-6 shrink-0 items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center text-white"
              exit={{
                opacity: 0,
                scale: 0.6,
                transition: ICON_TRANSITION,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              key={current.id}
              transition={{
                delay: 0.1,
                ...ICON_TRANSITION,
              }}
            >
              {current.icon}
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="-mx-8 overflow-hidden px-8"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 2rem, black calc(100% - 2rem), transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 2rem, black calc(100% - 2rem), transparent)",
          }}
        >
          <TextMorph
            as="span"
            duration={600}
            ease="cubic-bezier(0.41, 1.03, 0.6, 1.03)"
          >
            {current.label}
          </TextMorph>
        </div>
      </div>
    </div>
  );
}

export default TextMorphTransaction;
