"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

const CONTENT_VARIANTS = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 30 },
  },
} as const;

export default function HomePage() {
  const [transition, setTransition] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTransition(true), 1250);
    const timer2 = setTimeout(() => setIsLoaded(true), 2500);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <main
      className={cn(
        "relative h-dvh overflow-x-hidden",
        !isLoaded && "overflow-y-hidden"
      )}
    >
      <Header transition={transition} />

      <div className="flex h-dvh w-full flex-col justify-between">
        {transition && (
          <>
            <div>
              <motion.div
                animate={transition ? "visible" : "hidden"}
                className="w-full"
                initial="hidden"
                variants={CONTENT_VARIANTS}
              >
                <Hero key={String(transition)} />
              </motion.div>

              <Features />
            </div>

            <Footer />
          </>
        )}
      </div>
    </main>
  );
}
