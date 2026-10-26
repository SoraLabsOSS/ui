"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface TermItem {
  content: React.ReactNode;
  id: string;
  title: string;
}

export interface LegalScrollViewProps {
  className?: string;
  lastUpdated?: string;
  terms: TermItem[];
  title: string;
}

const TermSection = ({
  term,
  index,
  children,
  setActiveTerm,
}: {
  children: React.ReactNode;
  index: number;
  setActiveTerm: (index: number) => void;
  term: TermItem;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: 0.3,
    margin: "-100px 0px -50% 0px",
  });

  useEffect(() => {
    if (isInView) {
      setActiveTerm(index);
    }
  }, [isInView, index, setActiveTerm]);

  return (
    <div className="scroll-mt-32 space-y-4 md:space-y-6" id={term.id} ref={ref}>
      {children}
    </div>
  );
};

export function LegalScrollView({
  title,
  terms,
  lastUpdated = "June 24, 2026",
  className,
}: LegalScrollViewProps) {
  const [activeTerm, setActiveTerm] = useState(0);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-12 lg:pt-36 lg:pb-16",
        className
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-6 border-foreground/10 border-b pb-4 font-mono text-xs uppercase tracking-widest">
          <Link
            className={cn(
              "transition-colors",
              pathname === "/legal/terms"
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            href="/legal/terms"
          >
            Terms of Service
          </Link>
          <Link
            className={cn(
              "transition-colors",
              pathname === "/legal/privacy"
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            href="/legal/privacy"
          >
            Privacy Policy
          </Link>
          <span className="ml-auto font-normal text-muted-foreground lowercase">
            updated: {lastUpdated}
          </span>
        </div>

        <h1 className="mt-4 font-cal-sans text-3xl md:mt-5 md:text-5xl">
          {title}
        </h1>
      </div>

      <div className="relative mb-0 flex gap-12 pt-[40px] pb-0 md:pt-[60px]">
        <ul className="sticky top-28 hidden h-fit w-full max-w-[300px] space-y-4 border-foreground/10 border-l md:block">
          {terms.map((term, index) => (
            <li className="relative cursor-pointer pl-3" key={term.id}>
              <a href={`#${term.id}`}>
                {activeTerm === index && (
                  <motion.span
                    className="absolute top-1/2 -left-[1.5px] inline-block h-5 w-[2px] -translate-y-1/2 rounded-2xl bg-foreground"
                    layoutId="active-term"
                    transition={{
                      damping: 30,
                      stiffness: 400,
                      type: "spring" as const,
                    }}
                  />
                )}

                <p
                  className={cn(
                    "opacity-50 transition-opacity duration-200",
                    activeTerm === index && "opacity-100"
                  )}
                >
                  {term.title}
                </p>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-1 flex-col gap-[40px] md:gap-[60px]">
          {terms.map((term, index) => (
            <TermSection
              index={index}
              key={term.id}
              setActiveTerm={setActiveTerm}
              term={term}
            >
              <h3 className="font-cal-sans text-xl lg:text-3xl">
                {term.title}
              </h3>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                {term.content}
              </div>
            </TermSection>
          ))}
        </div>
      </div>
    </div>
  );
}
