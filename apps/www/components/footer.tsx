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
  COMMUNITY_ISSUES_URL,
  COMMUNITY_REPO_URL,
  CONTACT_EMAIL,
  GITHUB_REPO_URL,
  X_PROFILE_URL,
} from "@/lib/site";

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
      <footer className="footer" data-theme-section="light">
        <div className="is--md-m container">
          <div className="footer-inner">
            {/* Top Row: Newsletter + 3 Columns of Links */}
            <div className="footer-top__row">
              <div className="footer-top__links">
                {/* Newsletter Column */}
                {/* Sora UI Registry Banner Card (rounded-[2.5rem]) */}
                <div className="footer-form__col w-full max-w-full! lg:max-w-[35.1875em]!">
                  <Link
                    className="nav-banner group w-full w-inline-block"
                    href="/ui"
                    style={{ borderRadius: "2.5rem" }}
                  >
                    <div
                      className="nav-banner__before"
                      style={{ paddingTop: "75%" }}
                    />
                    <div className="nav-banner__content flex flex-col justify-between p-6 sm:p-8">
                      <div className="nav-banner__tags flex justify-center gap-1.5">
                        <div className="tag" data-shape="" data-theme="">
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-800"
                          />
                          <span className="is--relative eyebrow">Animated</span>
                        </div>
                        <div className="tag" data-shape="round" data-theme="">
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="coral"
                          />
                          <span className="is--relative eyebrow">React UI</span>
                        </div>
                      </div>
                      <div className="nav-banner__center-content flex flex-1 flex-col items-center justify-end">
                        <div className="nav-banner__title text-center">
                          <h2 className="h-m text-white">Sora UI Registry</h2>
                        </div>
                        <div className="nav-banner__btn flex justify-center pt-5">
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
                    className="footer-link__row"
                    data-accordion-close-siblings="true"
                  >
                    {/* 1. Components Column */}
                    <div
                      className="footer-link__col"
                      data-accordion-status={
                        openAccordion === "components" ? "active" : "not-active"
                      }
                    >
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Accordion Toggle */}
                      <div
                        className="footer-link__col-top"
                        data-accordion-toggle=""
                        data-hover=""
                        onClick={() => toggleAccordion("components")}
                      >
                        <h4 className="h-xs">Components</h4>
                        <svg
                          className="footer-link__col-icon"
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
                      </div>
                      <div className="footer-link__col-bottom">
                        <div className="footer-link__col-bottom-wrap">
                          <div className="footer-link__col-bottom-content">
                            <ul className="footer-link__col-ul">
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/docs/motion"
                                >
                                  Motion Primitives
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/ui"
                                >
                                  UI Foundation
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/catalog"
                                >
                                  Catalog Showcase
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/docs/icons"
                                >
                                  Animated Icons
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/docs/cli"
                                >
                                  Sora CLI
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Documentation Column */}
                    <div
                      className="footer-link__col"
                      data-accordion-status={
                        openAccordion === "documentation"
                          ? "active"
                          : "not-active"
                      }
                    >
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Accordion Toggle */}
                      <div
                        className="footer-link__col-top"
                        data-accordion-toggle=""
                        data-hover=""
                        onClick={() => toggleAccordion("documentation")}
                      >
                        <h4 className="h-xs">Documentation</h4>
                        <svg
                          className="footer-link__col-icon"
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
                      </div>
                      <div className="footer-link__col-bottom">
                        <div className="footer-link__col-bottom-wrap">
                          <div className="footer-link__col-bottom-content">
                            <ul className="footer-link__col-ul">
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/docs"
                                >
                                  Introduction
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/ui"
                                >
                                  Base UI &amp; Radix
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="underline-link p-m"
                                  data-underline-link=""
                                  href="/docs/changelog"
                                >
                                  Changelog
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/docs/troubleshooting"
                                >
                                  Troubleshooting
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Community Column */}
                    <div
                      className="footer-link__col is--last"
                      data-accordion-status={
                        openAccordion === "community" ? "active" : "not-active"
                      }
                    >
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Accordion Toggle */}
                      <div
                        className="footer-link__col-top"
                        data-accordion-toggle=""
                        data-hover=""
                        onClick={() => toggleAccordion("community")}
                      >
                        <h4 className="h-xs">Community</h4>
                        <svg
                          className="footer-link__col-icon"
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
                      </div>
                      <div className="footer-link__col-bottom">
                        <div className="footer-link__col-bottom-wrap">
                          <div className="footer-link__col-bottom-content">
                            <ul className="footer-link__col-ul">
                              <li className="footer-link__col-li">
                                <a
                                  className="underline-link p-m"
                                  data-underline-link=""
                                  href={GITHUB_REPO_URL}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  GitHub
                                </a>
                              </li>
                              <li className="footer-link__col-li">
                                <a
                                  className="p-m"
                                  data-underline-link=""
                                  href={COMMUNITY_REPO_URL}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Community Hub
                                </a>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/blog"
                                >
                                  Blog
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <Link
                                  className="p-m"
                                  data-underline-link=""
                                  href="/pricing"
                                >
                                  Pricing
                                </Link>
                              </li>
                              <li className="footer-link__col-li">
                                <a
                                  className="p-m"
                                  data-underline-link=""
                                  href={COMMUNITY_ISSUES_URL}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Report an Issue
                                </a>
                              </li>
                              <li className="footer-link__col-li">
                                <a
                                  className="p-m"
                                  data-barba-prevent=""
                                  data-underline-link=""
                                  href={`mailto:${CONTACT_EMAIL}`}
                                >
                                  Support
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons Row: Docs & Explore UI + Socials right below link columns */}
                  <div className="footer-top__button-row pt-2">
                    <div className="footer-top__button-col sm--hide">
                      <div className="button-row">
                        <Link
                          className="button w-inline-block rounded-[1.5rem]!"
                          data-barba-p=""
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
                          data-barba-p=""
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
                            <div className="button-label">
                              <span>Catalog</span>
                            </div>
                            <div aria-hidden="true" className="button-label">
                              <span>Catalog</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                    <div className="footer-top__button-col">
                      <div className="button-row">
                        {/* GitHub */}
                        <a
                          aria-label="GitHub"
                          className="square-button"
                          data-button-rotate-hover=""
                          data-shape="round"
                          data-size="r"
                          data-theme=""
                          href={GITHUB_REPO_URL}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-300"
                          />
                          <div className="button-icon__wrap">
                            <div className="button-icon">
                              <svg
                                className="svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title>GitHub</title>
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                              </svg>
                            </div>
                            <div className="button-icon">
                              <svg
                                className="svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title>GitHub</title>
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {/* X (Twitter) */}
                        <a
                          aria-label="X"
                          className="square-button"
                          data-button-rotate-hover=""
                          data-shape=""
                          data-size="r"
                          data-theme=""
                          href={X_PROFILE_URL}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-300"
                          />
                          <div className="button-icon__wrap">
                            <div className="button-icon">
                              <svg
                                className="svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title>X</title>
                                <path
                                  d="M13.71 10.59L20.41 2.79999H18.82L13 9.55999L8.35 2.79999H3L10.03 13.03L3 21.2H4.59L10.73 14.06L15.64 21.2H21L13.71 10.59ZM11.54 13.12L10.83 12.1L5.16 3.99999H7.6L12.17 10.54L12.88 11.56L18.82 20.06H16.38L11.53 13.12H11.54Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            <div className="button-icon">
                              <svg
                                className="svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title>X</title>
                                <path
                                  d="M13.71 10.59L20.41 2.79999H18.82L13 9.55999L8.35 2.79999H3L10.03 13.03L3 21.2H4.59L10.73 14.06L15.64 21.2H21L13.71 10.59ZM11.54 13.12L10.83 12.1L5.16 3.99999H7.6L12.17 10.54L12.88 11.56L18.82 20.06H16.38L11.53 13.12H11.54Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {/* Community */}
                        <a
                          aria-label="Community"
                          className="square-button"
                          data-button-rotate-hover=""
                          data-shape="round"
                          data-size="r"
                          data-theme=""
                          href={COMMUNITY_REPO_URL}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-300"
                          />
                          <div className="button-icon__wrap">
                            <div className="button-icon">
                              <svg
                                className="svg"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title>Community</title>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                            <div className="button-icon">
                              <svg
                                className="svg"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="100%"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title>Community</title>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Legal Pills + Copyright + Created By */}
            <div className="footer-bottom__row">
              <div className="footer-bottom__details">
                {/* Left Column: Legal Pills */}
                <div className="footer-bottom__details-col is--start">
                  <div className="footer-bottom__legal w-dyn-list">
                    {/* biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list structure */}
                    <div
                      className="footer-bottom__legal-list w-dyn-items"
                      role="list"
                    >
                      {/* biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list item */}
                      <div
                        className="footer-bottom__legal-item w-dyn-item"
                        role="listitem"
                      >
                        <a
                          className="button tag w-inline-block"
                          data-barba-p=""
                          data-button-rotate=""
                          data-button-rotate-hover=""
                          data-shape="square"
                          data-theme=""
                          href="https://github.com/SoraLabsOSS/ui/blob/main/LICENSE"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-800"
                          />
                          <div className="button-label__wrap">
                            <span className="button-label eyebrow">
                              License
                            </span>
                            <span
                              aria-hidden="true"
                              className="button-label eyebrow"
                            >
                              License
                            </span>
                          </div>
                        </a>
                      </div>
                      {/* biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list item */}
                      <div
                        className="footer-bottom__legal-item w-dyn-item"
                        role="listitem"
                      >
                        <Link
                          className="button tag w-inline-block"
                          data-barba-p=""
                          data-button-rotate=""
                          data-button-rotate-hover=""
                          data-shape="round"
                          data-theme=""
                          href="/legal/terms"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-800"
                          />
                          <div className="button-label__wrap">
                            <span className="button-label eyebrow">Terms</span>
                            <span
                              aria-hidden="true"
                              className="button-label eyebrow"
                            >
                              Terms
                            </span>
                          </div>
                        </Link>
                      </div>
                      {/* biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list item */}
                      <div
                        className="footer-bottom__legal-item w-dyn-item"
                        role="listitem"
                      >
                        <Link
                          className="button tag w-inline-block"
                          data-barba-p=""
                          data-button-rotate=""
                          data-button-rotate-hover=""
                          data-shape="square"
                          data-theme=""
                          href="/legal/privacy"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-800"
                          />
                          <div className="button-label__wrap">
                            <span className="button-label eyebrow">
                              Privacy
                            </span>
                            <span
                              aria-hidden="true"
                              className="button-label eyebrow"
                            >
                              Privacy
                            </span>
                          </div>
                        </Link>
                      </div>
                      {/* biome-ignore lint/a11y/useSemanticElements: Webflow dynamic list item */}
                      <div
                        className="footer-bottom__legal-item w-dyn-item"
                        role="listitem"
                      >
                        <a
                          className="button tag w-inline-block"
                          data-barba-p=""
                          data-button-rotate=""
                          data-button-rotate-hover=""
                          data-shape="round"
                          data-theme=""
                          href={COMMUNITY_REPO_URL}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <div
                            className="button-bg"
                            data-wf--button-theme--variant="neutral-800"
                          />
                          <div className="button-label__wrap">
                            <span className="button-label eyebrow">Hub</span>
                            <span
                              aria-hidden="true"
                              className="button-label eyebrow"
                            >
                              Hub
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Column: Copyright */}
                <div className="footer-bottom__details-col is--center">
                  <p className="eyebrow">
                    © <span data-current-year="">2026</span> sora ui
                  </p>
                </div>

                {/* Right Column: Created By Buttons */}
                <div className="footer-bottom__details-col is--end">
                  <span className="eyebrow">created by</span>
                  <div className="button-row">
                    <a
                      className="button tag w-inline-block"
                      data-barba-p="true"
                      data-button-rotate=""
                      data-button-rotate-hover=""
                      data-shape=""
                      data-theme=""
                      href="https://github.com/SoraLabsOSS"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div
                        className="button-bg"
                        data-wf--button-theme--variant="electric"
                      />
                      <div className="button-label__wrap">
                        <span className="button-label eyebrow">sora</span>
                        <span
                          aria-hidden="true"
                          className="button-label eyebrow"
                        >
                          sora
                        </span>
                      </div>
                    </a>
                    <a
                      className="button tag w-inline-block"
                      data-barba-p="true"
                      data-button-rotate=""
                      data-button-rotate-hover=""
                      data-shape="round"
                      data-theme=""
                      href={X_PROFILE_URL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <div
                        className="button-bg"
                        data-wf--button-theme--variant="electric"
                      />
                      <div className="button-label__wrap">
                        <span className="button-label eyebrow">labs</span>
                        <span
                          aria-hidden="true"
                          className="button-label eyebrow"
                        >
                          labs
                        </span>
                      </div>
                    </a>
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
