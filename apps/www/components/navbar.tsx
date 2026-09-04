"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "@/app/(home)/home.css";
import { useButton3DHover } from "@/hooks/use-button-3d-hover";
import { COMMUNITY_REPO_URL, GITHUB_REPO_URL, X_PROFILE_URL } from "@/lib/site";
import { UnderNavMarquee } from "./under-nav-marquee";

export interface NavbarProps {
  isMenuOpen?: boolean;
  isScrollingStarted?: boolean;
  onCloseMenu?: () => void;
  onToggleMenu?: () => void;
  scrollingDirection?: "up" | "down";
}

export function Navbar({
  isMenuOpen: isMenuOpenProp,
  onToggleMenu: onToggleMenuProp,
  onCloseMenu: onCloseMenuProp,
  isScrollingStarted: isScrollingStartedProp,
  scrollingDirection: scrollingDirectionProp,
}: NavbarProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useButton3DHover(containerRef);

  const pathname = usePathname();
  const router = useRouter();

  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [internalScrollingStarted, setInternalScrollingStarted] =
    useState(false);
  const [internalScrollingDirection, setInternalScrollingDirection] = useState<
    "up" | "down"
  >("up");

  const isMenuOpen = isMenuOpenProp ?? internalMenuOpen;
  const isScrollingStarted = isScrollingStartedProp ?? internalScrollingStarted;
  const scrollingDirection =
    scrollingDirectionProp ?? internalScrollingDirection;

  const handleToggleMenu =
    onToggleMenuProp ?? (() => setInternalMenuOpen((prev) => !prev));
  const handleCloseMenu = onCloseMenuProp ?? (() => setInternalMenuOpen(false));

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      href.startsWith("http")
    ) {
      handleCloseMenu();
      return;
    }

    if (isMenuOpen) {
      e.preventDefault();
      handleCloseMenu();

      if (pathname === href) {
        return;
      }

      setTimeout(() => {
        router.push(href);
      }, 550);
    } else {
      handleCloseMenu();
    }
  };

  // Reset navbar state on route navigation
  useEffect(() => {
    if (!pathname) {
      return;
    }
    setInternalMenuOpen(false);
    setInternalScrollingStarted(false);
    setInternalScrollingDirection("up");
    onCloseMenuProp?.();
  }, [pathname, onCloseMenuProp]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        handleCloseMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCloseMenu]);

  // Self-contained scroll monitoring when uncontrolled
  useEffect(() => {
    if (
      isScrollingStartedProp !== undefined &&
      scrollingDirectionProp !== undefined
    ) {
      return;
    }

    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setInternalScrollingStarted(currentScrollY > 30);

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setInternalScrollingDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setInternalScrollingDirection("up");
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isScrollingStartedProp, scrollingDirectionProp]);

  // Lock scroll when menu is open in uncontrolled mode
  useEffect(() => {
    if (isMenuOpenProp !== undefined || !internalMenuOpen) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [internalMenuOpen, isMenuOpenProp]);

  return (
    <div className="home-layout sora-navbar-root w-full" ref={containerRef}>
      <div
        className="nav"
        data-marketing-theme="dark"
        data-nav-status={isMenuOpen ? "active" : "not-active"}
        data-nav-theme="light"
        data-scrolling-direction={scrollingDirection}
        data-scrolling-started={isScrollingStarted ? "true" : "false"}
        style={{
          opacity: 1,
          visibility: "visible",
        }}
      >
        {/* Background backdrop for menu drawer */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Backdrop click closes menu */}
        <div
          className="nav__bg"
          data-nav-toggle="close"
          onClick={handleCloseMenu}
        />

        <div className="nav-bar__wrap">
          <div className="nav-bar__width">
            <div className="nav-bar">
              <div className="nav-bar__back">
                <div className="nav-bar__outline" />
                <div className="nav-bar__bg" />
              </div>

              {/* Top Bar */}
              <div className="nav-bar__top" data-nav-bar-height="">
                {/* Menu Hamburger Button */}
                <div className="nav-bar__menu">
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveElementInteractions: Interactive menu toggle */}
                  <div
                    className="nav-menu"
                    data-nav-toggle="toggle"
                    onClick={handleToggleMenu}
                  >
                    <div className="nav-menu__hamburger">
                      <div className="nav-menu__hamburger-bar" />
                      <div className="nav-menu__hamburger-bar" />
                    </div>
                    <span className="nav-menu__label">
                      {isMenuOpen ? "Close" : "Menu"}
                    </span>
                  </div>
                </div>

                {/* Logo (Wordmark <-> Icon Morph) */}
                <div className="nav-bar__logo">
                  <Link
                    aria-current="page"
                    aria-label="go to homepage"
                    className="nav-logo w--current w-inline-block"
                    href="/"
                    onClick={(e) => handleLinkClick(e, "/")}
                  >
                    <svg
                      className="nav-logo__wordmark-svg"
                      fill="none"
                      viewBox="0 0 280 70"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Sora UI</title>
                      <text
                        fill="currentColor"
                        fontFamily="'Haffer XH', 'Haffer VF', -apple-system, BlinkMacSystemFont, sans-serif"
                        fontSize="54"
                        fontWeight="900"
                        letterSpacing="-1.5px"
                        textAnchor="middle"
                        x="50%"
                        y="50"
                      >
                        SORA UI
                      </text>
                    </svg>
                    <svg
                      className="nav-logo__icon-svg"
                      fill="currentColor"
                      viewBox="0 0 200 200"
                    >
                      <title>Sora UI Icon</title>
                      <g transform="translate(100 100) scale(0.8292) translate(-100 -100)">
                        <path d="M 150.245 -0.676 L 150.658 49.581 L 49.237 49.477 L 49.714 -0.758 L 150.245 -0.676 Z M 49.342 150.419 L 49.237 49.477 L -1.04 49.794 L -1.304 150.337 L 49.342 150.419 Z M 150.763 150.523 L 150.658 49.581 L 201.304 49.663 L 201.04 150.206 L 150.763 150.523 Z M 150.763 150.523 L 49.342 150.419 L 49.755 200.676 L 150.286 200.758 L 150.763 150.523 Z" />
                      </g>
                    </svg>
                  </Link>
                </div>

                {/* Action Buttons: 1 Round (Login) + 1 Square (Docs) */}
                <div className="nav-bar__buttons">
                  <div className="nav-bar__login-button">
                    {/* Auth temporarily disabled — swap span back to Link when auth is re-enabled */}
                    {/* biome-ignore lint/a11y/useFocusableInteractive lint/a11y/useSemanticElements: Auth temporarily disabled */}
                    <span
                      aria-disabled="true"
                      className="button pointer-events-none w-inline-block cursor-not-allowed opacity-40"
                      data-barba-p=""
                      data-button-rotate=""
                      data-button-rotate-hover=""
                      data-outseta-type="login"
                      data-responsive=""
                      data-shape="round"
                      data-size=""
                      data-theme=""
                      role="link"
                      title="Đăng nhập tạm thời không khả dụng"
                    >
                      <div
                        className="button-bg"
                        data-wf--button-theme--variant="neutral-525"
                      />
                      <div className="button-label__wrap">
                        <div className="button-label">
                          <span>Login</span>
                        </div>
                        <div aria-hidden="true" className="button-label">
                          <span>Login</span>
                        </div>
                      </div>
                    </span>
                  </div>
                  <div className="nav-bar__signup-button">
                    <Link
                      className="button w-inline-block"
                      data-barba-p=""
                      data-button-rotate=""
                      data-button-rotate-hover=""
                      data-outseta-type="join"
                      data-responsive=""
                      data-shape=""
                      data-size=""
                      data-theme=""
                      href="/docs"
                      onClick={(e) => handleLinkClick(e, "/docs")}
                    >
                      <div
                        className="button-bg"
                        data-wf--button-theme--variant="electric"
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
                  </div>
                </div>

                <div className="nav-bar__line" />
              </div>

              {/* Bottom Drawer Content */}
              <div className="nav-bar__bottom">
                <div className="nav-bar__bottom-overflow">
                  <div className="nav-bar__bottom-inner" data-lenis-prevent="">
                    <div className="nav-bar__bottom-row">
                      {/* Products Column */}
                      <div className="is--products nav-bar__bottom-col">
                        <div className="nav-bar__tag-row">
                          <span className="eyebrow">Products</span>
                        </div>
                        <ul className="nav-bar__ul-big">
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/docs/motion"
                              onClick={(e) =>
                                handleLinkClick(e, "/docs/motion")
                              }
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Motion Primitives
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/ui"
                              onClick={(e) => handleLinkClick(e, "/ui")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                UI Foundation
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/catalog"
                              onClick={(e) => handleLinkClick(e, "/catalog")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Catalog Showcase
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/docs/icons"
                              onClick={(e) => handleLinkClick(e, "/docs/icons")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Animated Icons
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/docs/cli"
                              onClick={(e) => handleLinkClick(e, "/docs/cli")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Sora CLI
                              </span>
                            </Link>
                          </li>
                        </ul>
                        <ul className="nav-bar__small-ul">
                          <li className="nav-bar__small-li">
                            <Link
                              className="nav-bar__small-a w-inline-block"
                              data-hover=""
                              href="/ui"
                              onClick={(e) => handleLinkClick(e, "/ui")}
                            >
                              <span
                                className="nav-bar__small-span"
                                data-underline-link=""
                              >
                                Base UI Components
                              </span>
                            </Link>
                          </li>
                          <li className="nav-bar__small-li">
                            <Link
                              className="nav-bar__small-a w-inline-block"
                              data-hover=""
                              href="/ui"
                              onClick={(e) => handleLinkClick(e, "/ui")}
                            >
                              <span
                                className="nav-bar__small-span"
                                data-underline-link=""
                              >
                                Radix UI Components
                              </span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Explore Column */}
                      <div className="nav-bar__bottom-col">
                        <div className="is--membership nav-bar__tag-row">
                          <span className="eyebrow">Explore</span>
                        </div>
                        <ul className="nav-bar__ul-big">
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/docs"
                              onClick={(e) => handleLinkClick(e, "/docs")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Documentation
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/catalog"
                              onClick={(e) => handleLinkClick(e, "/catalog")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Catalog Layouts
                              </span>
                              <span
                                className="nav-bar__big-span-number"
                                data-vault-total=""
                              >
                                20+
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/blog"
                              onClick={(e) => handleLinkClick(e, "/blog")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Blog
                              </span>
                            </Link>
                            <div className="is--nav-transparent line" />
                          </li>
                          <li className="nav-bar__big-li">
                            <Link
                              className="nav-bar__big-a w-inline-block"
                              data-hover=""
                              href="/pricing"
                              onClick={(e) => handleLinkClick(e, "/pricing")}
                            >
                              <span
                                className="nav-bar__big-span"
                                data-underline-link=""
                              >
                                Pricing
                              </span>
                            </Link>
                          </li>
                        </ul>

                        {/* Socials */}
                        <div className="nav-bar__socials">
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
                                data-wf--button-theme--variant="neutral-600"
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

                            {/* X */}
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
                                data-wf--button-theme--variant="neutral-600"
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
                                data-wf--button-theme--variant="neutral-600"
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

                      {/* Featured Pro Ad / Promotion Column */}
                      <div className="is--ad nav-bar__bottom-col">
                        <Link
                          className="nav-banner w-inline-block"
                          data-hover=""
                          href="/ui"
                          onClick={(e) => handleLinkClick(e, "/ui")}
                        >
                          <div className="nav-banner__before" />
                          <div className="nav-banner__content">
                            <div className="nav-banner__tags">
                              <div className="tag" data-shape="" data-theme="">
                                <div
                                  className="button-bg"
                                  data-wf--button-theme--variant="neutral-800"
                                />
                                <span className="is--relative eyebrow">
                                  Animated
                                </span>
                              </div>
                              <div
                                className="tag"
                                data-shape="round"
                                data-theme=""
                              >
                                <div
                                  className="button-bg"
                                  data-wf--button-theme--variant="purple"
                                />
                                <span className="is--relative eyebrow">
                                  React UI
                                </span>
                              </div>
                            </div>
                            <div className="nav-banner__center-content">
                              <div className="nav-banner__title">
                                <h2 className="h-m">Sora UI Registry</h2>
                              </div>
                              <div className="nav-banner__btn">
                                <button
                                  className="button"
                                  data-button-rotate=""
                                  data-button-rotate-hover=""
                                  data-responsive=""
                                  data-shape=""
                                  data-size=""
                                  data-theme=""
                                  type="button"
                                >
                                  <div
                                    className="button-bg"
                                    data-wf--button-theme--variant="neutral-200"
                                  />
                                  <div className="button-label__wrap">
                                    <div className="button-label">
                                      <span>Explore Components</span>
                                    </div>
                                    <div
                                      aria-hidden="true"
                                      className="button-label"
                                    >
                                      <span>Explore Components</span>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UnderNavMarquee
        isMenuOpen={isMenuOpen}
        isScrollingStarted={isScrollingStarted}
      />
    </div>
  );
}
