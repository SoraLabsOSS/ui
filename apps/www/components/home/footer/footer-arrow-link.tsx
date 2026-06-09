"use client";

import { TextScramble } from "@workspace/ui/components/sora-ui/texts/text-scramble";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { type ComponentProps, useState } from "react";
import { SECTION_CTA_SCRAMBLE_DEFAULTS } from "@/components/buttons/section-cta-scramble";

/** Lowercase-heavy pool — matches sentence-case footer link labels. */
const FOOTER_LINK_SCRAMBLE_CHARS =
  "abcdefghijklmnopqrstuvwxyz0123456789<>{}[]();:=+-*/%&|^~!?#@$_.,";

type FooterArrowLinkProps = {
  href: string;
  children: string;
  className?: string;
  external?: boolean;
  textClassName?: string;
} & Omit<ComponentProps<"a">, "href" | "children">;

export function FooterArrowLink({
  href,
  children,
  className,
  external,
  textClassName,
  ...props
}: FooterArrowLinkProps) {
  const [isActive, setIsActive] = useState(false);

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 my-auto size-[0.75em] translate-y-[-0.05em] -rotate-90 scale-0 bg-accent-pro transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isActive && "rotate-0 scale-100"
        )}
      />
      <span
        className={cn(
          "pointer-events-none relative inline-block whitespace-nowrap transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isActive && "translate-x-[1.5em]",
          textClassName
        )}
      >
        <span aria-hidden="true" className="invisible select-none">
          {children}
        </span>
        <TextScramble
          as="span"
          characterSet={FOOTER_LINK_SCRAMBLE_CHARS}
          className="absolute top-0 left-0 inline-block font-[inherit] text-[color:inherit] text-[length:inherit] leading-[inherit] tracking-[inherit]"
          duration={SECTION_CTA_SCRAMBLE_DEFAULTS.scrambleDuration}
          holdDuration={SECTION_CTA_SCRAMBLE_DEFAULTS.scrambleHoldDuration}
          scrambleColor="#fb460d"
          speed={SECTION_CTA_SCRAMBLE_DEFAULTS.scrambleSpeed}
          trigger={isActive}
          triggerOnHover={false}
        >
          {children}
        </TextScramble>
      </span>
    </>
  );

  const linkClassName = cn(
    "group relative inline-flex w-fit items-center text-foreground",
    className
  );

  const handlers = {
    onBlur: () => {
      setIsActive(false);
    },
    onFocus: () => {
      setIsActive(true);
    },
    onMouseEnter: () => {
      setIsActive(true);
    },
    onMouseLeave: () => {
      setIsActive(false);
    },
  };

  if (external || href.startsWith("http")) {
    return (
      <a
        className={linkClassName}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...handlers}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={linkClassName} href={href} {...handlers} {...props}>
      {content}
    </Link>
  );
}
