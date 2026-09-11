"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useButton3DHover } from "@/hooks/use-button-3d-hover";
import { GITHUB_SPONSORS_URL, PRICING_DISCLAIMER } from "./pricing-config";

const FREE_FEATURES = [
  "All Motion animation primitives",
  "Base UI & Radix UI animated components",
  "Full TypeScript & Tailwind CSS v4 code",
  "Direct install via shadcn CLI commands",
  "Commercial license for unlimited projects",
  "Lifetime updates & new releases",
] as const;

const SPONSOR_FEATURES = [
  "Help prioritize upcoming components",
  "Suggest new motion primitives & blocks",
  "GitHub Sponsors profile badge",
  "Direct maintainer discussion & input",
  "Keeps Sora UI 100% free for everyone",
] as const;

export function PricingCards() {
  const containerRef = useRef<HTMLElement>(null);
  useButton3DHover(containerRef);

  return (
    <section
      className="relative z-10 py-[var(--padding-s)] pb-[var(--padding-m)]"
      id="plans"
      ref={containerRef}
    >
      <div className="is--md-m container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-stretch gap-[var(--gap-m)] sm:grid-cols-2 sm:gap-[var(--gap-l)]">
          {/* Card 1: Free Tier */}
          <div className="pricing-card is--free relative flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-[var(--gap-xs)]">
                <div
                  className="tag rounded-[1.5rem]! px-[0.85em] pt-[0.35em] pb-[0.3em]"
                  data-shape="round"
                  data-theme=""
                  style={{ borderRadius: "1.5rem" }}
                >
                  <div
                    className="button-bg rounded-[1.5rem]!"
                    data-wf--button-theme--variant="coral"
                    style={{ borderRadius: "1.5rem" }}
                  />
                  <span className="is--relative eyebrow flex items-center gap-1.5">
                    <span className="size-1.5 animate-pulse rounded-full bg-current" />
                    Free Forever
                  </span>
                </div>
                <span className="eyebrow text-[var(--color-neutral-500)]">
                  Open Source
                </span>
              </div>

              <div className="mt-[1.25em] flex items-baseline gap-[0.375em]">
                <h2 className="m-0 font-[Haffer_XH,Arial,sans-serif] font-normal text-[3.25em] leading-none tracking-[-0.04em] max-[479px]:text-[2.75em]">
                  $0
                </h2>
                <span className="eyebrow text-[var(--color-neutral-500)]">
                  / forever
                </span>
              </div>

              <p className="mt-[0.75em] mb-0 font-[Haffer_VF,Arial,sans-serif] text-[1em] text-[var(--color-neutral-525)] leading-[1.5] tracking-[-0.01em] [font-variation-settings:'wght'_460]">
                Full access to every animated primitive, component, and layout
                with zero paywalls or limits.
              </p>

              <div className="mt-[1.75em] mb-[1.75em] border-0 border-[var(--color-neutral-400)] border-t-[var(--stroke-weight)]" />

              <ul className="flex list-none flex-col gap-[0.875em] p-0">
                {FREE_FEATURES.map((feature) => (
                  <li
                    className="flex items-start gap-[0.75em] p-0"
                    key={feature}
                  >
                    <div className="mt-[0.1875em] flex size-[1.25em] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-coral)_14%,transparent)] text-[var(--color-coral)]">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                    <span className="font-[Haffer_VF,Arial,sans-serif] text-[0.9375em] text-[var(--color-neutral-800)] leading-[1.45] tracking-[-0.01em] [font-variation-settings:'wght'_460]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-[2.25em] flex flex-col gap-[0.625em]">
              <Link
                className="button w-inline-block rounded-[1.5rem]!"
                data-button-rotate=""
                data-button-rotate-hover=""
                data-shape="round"
                data-size="full"
                data-theme=""
                href="/docs/installation"
                style={{ borderRadius: "1.5rem" }}
              >
                <div
                  className="button-bg rounded-[1.5rem]!"
                  data-wf--button-theme--variant="electric"
                  style={{ borderRadius: "1.5rem" }}
                />
                <div className="button-label__wrap">
                  <div className="button-label">
                    <span>Start Installing</span>
                  </div>
                  <div aria-hidden="true" className="button-label">
                    <span>Start Installing</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Card 2: Community Support Card */}
          <div className="pricing-card is--sponsor relative flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-[var(--gap-xs)]">
                <div
                  className="tag rounded-[1.5rem]! px-[0.85em] pt-[0.35em] pb-[0.3em]"
                  data-shape="round"
                  data-theme=""
                  style={{ borderRadius: "1.5rem" }}
                >
                  <div
                    className="button-bg rounded-[1.5rem]!"
                    data-wf--button-theme--variant="neutral-525"
                    style={{ borderRadius: "1.5rem" }}
                  />
                  <span className="is--relative eyebrow">Community</span>
                </div>
                <span className="scribble pricing-card__scribble">
                  Keep it free for all!
                </span>
              </div>

              <div className="mt-[1.25em] flex items-baseline gap-[0.375em]">
                <h2 className="m-0 font-[Haffer_XH,Arial,sans-serif] font-normal text-[3.25em] leading-none tracking-[-0.04em] max-[479px]:text-[2.75em]">
                  Optional
                </h2>
                <span className="eyebrow text-[var(--color-neutral-500)]">
                  / sponsors
                </span>
              </div>

              <p className="mt-[0.75em] mb-0 font-[Haffer_VF,Arial,sans-serif] text-[1em] text-[var(--color-neutral-525)] leading-[1.5] tracking-[-0.01em] [font-variation-settings:'wght'_460]">
                Support independent open-source development and help keep Sora
                UI actively maintained.
              </p>

              <div className="mt-[1.75em] mb-[1.75em] border-0 border-[var(--color-neutral-400)] border-t-[var(--stroke-weight)]" />

              <ul className="flex list-none flex-col gap-[0.875em] p-0">
                {SPONSOR_FEATURES.map((feature) => (
                  <li
                    className="flex items-start gap-[0.75em] p-0"
                    key={feature}
                  >
                    <div className="mt-[0.1875em] flex size-[1.25em] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-electric)_16%,transparent)] text-[var(--color-electric)]">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                    <span className="pricing-card__feature-text">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-[2.25em] flex flex-col gap-[0.625em]">
              <a
                className="button w-inline-block rounded-[.875rem]!"
                data-button-rotate=""
                data-button-rotate-hover=""
                data-shape=""
                data-size="full"
                data-theme=""
                href={GITHUB_SPONSORS_URL}
                rel="noopener noreferrer"
                style={{ borderRadius: ".875rem" }}
                target="_blank"
              >
                <div
                  className="button-bg rounded-[.875rem]!"
                  data-wf--button-theme--variant="dark-outline"
                  style={{ borderRadius: ".875rem" }}
                />
                <div className="button-label__wrap">
                  <div className="button-label">
                    <span>Support on GitHub</span>
                  </div>
                  <div aria-hidden="true" className="button-label">
                    <span>Support on GitHub</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="mx-auto mt-[3em] max-w-[42em] text-center">
          <p className="m-0 font-[Haffer_VF,Arial,sans-serif] text-[0.875em] text-[var(--color-neutral-500)] leading-[1.5] [font-variation-settings:'wght'_420]">
            {PRICING_DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
}
