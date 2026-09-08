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
    <section className="pricing-cards" id="plans" ref={containerRef}>
      <div className="is--md-m container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="pricing-cards__grid">
          {/* Card 1: Free Tier */}
          <div className="pricing-card is--free">
            <div>
              <div className="pricing-card__header">
                <div
                  className="tag rounded-[1.5rem]!"
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
                <span
                  className="eyebrow"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Open Source
                </span>
              </div>

              <div className="pricing-card__price-row">
                <h2 className="pricing-card__price">$0</h2>
                <span className="eyebrow pricing-card__period">/ forever</span>
              </div>

              <p className="pricing-card__description">
                Full access to every animated primitive, component, and layout
                with zero paywalls or limits.
              </p>

              <div className="pricing-card__divider" />

              <ul className="pricing-card__features">
                {FREE_FEATURES.map((feature) => (
                  <li className="pricing-card__feature" key={feature}>
                    <div className="pricing-card__check">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                    <span className="pricing-card__feature-text">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pricing-card__actions">
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
          <div className="pricing-card is--sponsor">
            <div>
              <div className="pricing-card__header">
                <div
                  className="tag rounded-[1.5rem]!"
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

              <div className="pricing-card__price-row">
                <h2 className="pricing-card__price">Optional</h2>
                <span className="eyebrow pricing-card__period">/ sponsors</span>
              </div>

              <p className="pricing-card__description">
                Support independent open-source development and help keep Sora
                UI actively maintained.
              </p>

              <div className="pricing-card__divider" />

              <ul className="pricing-card__features">
                {SPONSOR_FEATURES.map((feature) => (
                  <li className="pricing-card__feature" key={feature}>
                    <div className="pricing-card__check">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                    <span className="pricing-card__feature-text">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pricing-card__actions">
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
        <div className="pricing-disclaimer">
          <p>{PRICING_DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}
