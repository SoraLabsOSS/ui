"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "@/app/(marketing)/home.css";
import {
  normalizePathname,
  type TransitionMode,
  usePageTransition,
} from "@/components/page-transition/page-transition-provider";
import { useButton3DHover } from "@/hooks/use-button-3d-hover";
import {
  FOOTER_COLUMNS,
  FOOTER_CREATORS,
  FOOTER_LEGAL_LINKS,
  NAV_SOCIALS,
} from "@/lib/navigation";
import { SocialIcon } from "./social-icons";

function AccordionToggleSvg() {
  return (
    <svg
      className="hidden size-[0.625em] shrink-0 rotate-0 items-center justify-center transition-transform duration-[var(--duration-default)] ease-[var(--cubic-default)] group-data-[accordion-status=active]:rotate-[315deg] max-[767px]:flex"
      fill="none"
      viewBox="0 0 13 13"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Toggle</title>
      <path
        d="M5.96149 12.0996V6.99217H0.839844V5.20705H5.96149V0.0996094H7.74294V5.20705H12.8398V6.99217H7.74294V12.0996H5.96149Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  useButton3DHover(containerRef);

  const pathname = usePathname();
  const { transitionTo } = usePageTransition();

  const [openAccordion, setOpenAccordion] = useState<string | null>(
    "components"
  );

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || anchor.dataset.transitionPrevent !== undefined) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const targetPath = normalizePathname(href);
      const currentPath = normalizePathname(pathname);

      if (targetPath === currentPath) {
        return;
      }

      e.preventDefault();
      const mode: TransitionMode =
        targetPath === "/docs" || targetPath.startsWith("/docs")
          ? "docs"
          : "commercial";
      transitionTo(href, mode);
    };

    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [pathname, transitionTo]);

  return (
    <div className="home-layout sora-footer-root w-full" ref={containerRef}>
      <footer className="relative" data-theme-section="light">
        <div className="is--md-m container">
          <div className="flex min-h-auto flex-col justify-start gap-[var(--gap-xxl)] py-[var(--gap-xxl)] pb-[var(--gap-l)]">
            {/* Top Row: Newsletter + 3 Columns of Links */}
            <div className="flex flex-col gap-[3.75em] max-[767px]:gap-[var(--gap-xxl)]">
              <div className="flex items-start gap-[8.5em] max-[991px]:flex-col max-[767px]:gap-[var(--gap-xxl)] max-[991px]:gap-[4.5em]">
                {/* Newsletter Column */}
                <div className="flex w-full max-w-full! flex-col items-start justify-start gap-[var(--gap-xxl)] lg:max-w-[35.1875em]!">
                  <Link
                    className="sora-footer-registry-card relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border text-white dark:text-neutral-100"
                    href="/ui"
                  >
                    <div className="box-border flex size-full flex-col justify-between px-10 py-10">
                      <div className="flex justify-center gap-1.5">
                        <div className="tag" data-shape="" data-theme="">
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-800"
                          />
                          <span className="is--relative eyebrow text-neutral-200">
                            Animated
                          </span>
                        </div>
                        <div className="tag" data-shape="round" data-theme="">
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="coral"
                          />
                          <span className="is--relative eyebrow text-white">
                            React UI
                          </span>
                        </div>
                      </div>
                      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-end">
                        <div className="text-center">
                          <h2
                            className="h-m text-white dark:text-neutral-100"
                            style={{
                              color: "#fff",
                              WebkitTextFillColor: "#fff",
                            }}
                          >
                            Sora UI
                          </h2>
                        </div>
                        <div className="flex justify-center pt-6">
                          <span
                            className="button"
                            data-button-rotate=""
                            data-button-rotate-hover=""
                            data-responsive=""
                            data-shape=""
                            data-size=""
                            data-theme=""
                          >
                            <div
                              className="button-bg"
                              data-wf--button-theme--variant="neutral-200"
                            />
                            <div className="button-label__wrap">
                              <div className="button-label">
                                <span>Explore Components</span>
                              </div>
                              <div aria-hidden="true" className="button-label">
                                <span>Explore Components</span>
                              </div>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Accordion Columns + Buttons on the same right side */}
                <div className="flex flex-1 flex-col justify-between gap-8 self-stretch">
                  <div
                    className="flex w-full items-start gap-[var(--gap-sm)] max-[767px]:flex-col max-[767px]:gap-0"
                    data-accordion-close-siblings="true"
                  >
                    {FOOTER_COLUMNS.map((column) => (
                      <div
                        className="group w-full max-w-[13.375em] max-[767px]:-ms-[var(--gap-l)] max-[767px]:w-screen max-[767px]:max-w-none max-[767px]:border-neutral-400 max-[767px]:border-t max-[767px]:last:border-b"
                        data-accordion-status={
                          openAccordion === column.id ? "active" : "not-active"
                        }
                        key={column.id}
                      >
                        {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Accordion Toggle */}
                        <div
                          className="flex items-center justify-between pb-[var(--gap-xxl)] max-[767px]:min-h-[3.5rem] max-[767px]:cursor-pointer max-[767px]:px-[var(--gap-l)] max-[767px]:py-[var(--gap-m)]"
                          data-accordion-toggle=""
                          data-hover=""
                          onClick={() => toggleAccordion(column.id)}
                        >
                          <h4 className="h-xs">{column.title}</h4>
                          <AccordionToggleSvg />
                        </div>
                        <div className="relative grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows] duration-[var(--duration-default)] ease-[var(--cubic-default)] group-data-[accordion-status=active]:grid-rows-[1fr] max-[767px]:grid-rows-[0fr]">
                          <div className="relative flex h-[100000%] flex-col overflow-hidden">
                            <div className="max-[767px]:px-[var(--gap-l)] max-[767px]:pb-[var(--gap-l)]">
                              <ul className="flex list-none flex-col items-start justify-start gap-[0.3125em] pb-[0.125em] max-[767px]:gap-[var(--gap-xxs)]">
                                {column.links.map((link) => (
                                  <li key={link.label}>
                                    {link.external ? (
                                      <a
                                        className="p-m"
                                        data-underline-link=""
                                        href={link.href}
                                        rel="noopener noreferrer"
                                        target={
                                          link.href.startsWith("http")
                                            ? "_blank"
                                            : undefined
                                        }
                                      >
                                        {link.label}
                                      </a>
                                    ) : (
                                      <Link
                                        className="p-m"
                                        data-underline-link=""
                                        href={link.href}
                                      >
                                        {link.label}
                                      </Link>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Buttons Row: Docs & Explore UI + Socials right below link columns */}
                  <div className="flex w-full items-start gap-[var(--gap-sm)] pt-2 max-[767px]:flex-col max-[767px]:items-center max-[767px]:justify-center max-[767px]:gap-0">
                    <div className="w-full max-w-[13.375em] max-[767px]:hidden">
                      <div className="button-row">
                        <Link
                          className="button w-inline-block rounded-[1.5rem]!"
                          data-button-rotate=""
                          data-button-rotate-hover=""
                          data-responsive=""
                          data-shape="round"
                          data-size=""
                          data-theme=""
                          href="/docs"
                          style={{ borderRadius: "1.5rem" }}
                        >
                          <div
                            className="button-bg rounded-[1.5rem]!"
                            data-wf--button-theme--variant="neutral-800"
                            style={{ borderRadius: "1.5rem" }}
                          />
                          <div className="button-label__wrap">
                            <div className="button-label">
                              <span>Docs</span>
                            </div>
                            <div aria-hidden="true" className="button-label">
                              <span>Docs</span>
                            </div>
                          </div>
                        </Link>
                        <Link
                          className="button w-inline-block rounded-[.875rem]!"
                          data-button-rotate=""
                          data-button-rotate-hover=""
                          data-responsive=""
                          data-shape=""
                          data-size=""
                          data-theme=""
                          href="/catalog"
                          style={{ borderRadius: ".875rem" }}
                        >
                          <div
                            className="button-bg rounded-[.875rem]!"
                            data-wf--button-theme--variant="electric"
                            style={{ borderRadius: ".875rem" }}
                          />
                          <div className="button-label__wrap">
                            <div className="button-label text-white">
                              <span>Catalog</span>
                            </div>
                            <div
                              aria-hidden="true"
                              className="button-label text-white"
                            >
                              <span>Catalog</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                    <div className="w-full max-w-[13.375em] max-[767px]:w-auto max-[767px]:max-w-none">
                      <div className="button-row">
                        {NAV_SOCIALS.map((social) => (
                          <a
                            aria-label={social.label}
                            className="square-button"
                            data-button-rotate-hover=""
                            data-shape={social.shape}
                            data-size="r"
                            data-theme=""
                            href={social.href}
                            key={social.label}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <div
                              className="button-bg"
                              data-wf--button-theme--variant="neutral-300"
                            />
                            <div className="button-icon__wrap">
                              <div className="button-icon">
                                <SocialIcon type={social.type} />
                              </div>
                              <div className="button-icon">
                                <SocialIcon type={social.type} />
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Legal Pills + Copyright + Created By */}
            <div className="mt-[var(--gap-xl)] flex flex-col gap-[var(--gap-xl)] border-neutral-300 border-t pt-[var(--gap-m)] max-[767px]:mt-0 max-[767px]:items-center max-[767px]:justify-start max-[767px]:gap-[var(--gap-sm)]">
              <div className="grid grid-cols-3 max-[767px]:contents">
                {/* Left Column: Legal Pills */}
                <div>
                  <div className="flex w-full">
                    {/* biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list structure */}
                    <div
                      className="flex max-w-full flex-wrap items-center justify-center"
                      role="list"
                    >
                      {FOOTER_LEGAL_LINKS.map((link) => (
                        // biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list item
                        <div
                          className="w-dyn-item"
                          key={link.label}
                          role="listitem"
                        >
                          {link.external ? (
                            <a
                              className="button tag w-inline-block"
                              data-button-rotate=""
                              data-button-rotate-hover=""
                              data-shape={link.shape}
                              data-theme=""
                              href={link.href}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <div
                                className="button-bg"
                                data-wf--button-theme--variant="neutral-800"
                              />
                              <div className="button-label__wrap">
                                <span className="button-label eyebrow">
                                  {link.label}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="button-label eyebrow"
                                >
                                  {link.label}
                                </span>
                              </div>
                            </a>
                          ) : (
                            <Link
                              className="button tag w-inline-block"
                              data-button-rotate=""
                              data-button-rotate-hover=""
                              data-shape={link.shape}
                              data-theme=""
                              href={link.href}
                            >
                              <div
                                className="button-bg"
                                data-wf--button-theme--variant="neutral-800"
                              />
                              <div className="button-label__wrap">
                                <span className="button-label eyebrow">
                                  {link.label}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="button-label eyebrow"
                                >
                                  {link.label}
                                </span>
                              </div>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center Column: Copyright */}
                <div className="flex items-center justify-center">
                  <p className="eyebrow">
                    © <span data-current-year="">2026</span> sora ui
                  </p>
                </div>

                {/* Right Column: Created By Buttons */}
                <div className="order-none flex items-center justify-end gap-[var(--gap-xxs)] max-[767px]:order-[-1]">
                  <span className="eyebrow">created by</span>
                  <div className="button-row">
                    {FOOTER_CREATORS.map((creator) => (
                      <a
                        className="button tag w-inline-block"
                        data-button-rotate=""
                        data-button-rotate-hover=""
                        data-shape={creator.shape}
                        data-theme=""
                        href={creator.href}
                        key={creator.label}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <div
                          className="button-bg"
                          data-wf--button-theme--variant="electric"
                        />
                        <div className="button-label__wrap">
                          <span className="button-label eyebrow text-white">
                            {creator.label}
                          </span>
                          <span
                            aria-hidden="true"
                            className="button-label eyebrow text-white"
                          >
                            {creator.label}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
