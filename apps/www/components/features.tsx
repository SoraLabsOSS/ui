import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { MotionEffect } from "./effects/motion-effect";
import { Blocks } from "./icons/blocks";
import { Components } from "./icons/components";

const COMPONENTS = [
  {
    name: "Components",
    href: "/docs/primitives/text-reveal",
    icon: <Components />,
  },
  {
    name: "Soon...",
    icon: (
      <div className="relative">
        <Blocks />
      </div>
    ),
  },
];

const dancing = Dancing_Script({ subsets: ["latin"] });

export const Features = () => {
  return (
    <div className="relative mt-auto flex flex-col items-center justify-center px-5 pt-16 pb-10">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
        {COMPONENTS.map((component, index) => {
          const Component = component.href ? Link : "div";
          return (
            <MotionEffect
              delay={1 + 0.15 * index}
              fade
              key={index}
              slide={{
                direction: "down",
              }}
              zoom
            >
              {/* @ts-ignore */}
              <Component {...(component.href ? { href: component.href } : {})}>
                <motion.div
                  className={cn(
                    "relative w-full rounded-2xl bg-neutral-100 pt-1 dark:bg-neutral-800",
                    !component?.href && "cursor-not-allowed opacity-50"
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: component.href ? 1.025 : 1,
                  }}
                  whileTap={{
                    scale: component.href ? 0.925 : 1,
                  }}
                >
                  <p
                    className={cn(
                      dancing.className,
                      "absolute top-3 xs:top-2 left-1/2 -translate-x-1/2 font-black text-[22px] text-muted-foreground"
                    )}
                  >
                    {component.name}
                  </p>

                  {component.icon}
                </motion.div>
              </Component>
            </MotionEffect>
          );
        })}
      </div>
    </div>
  );
};
