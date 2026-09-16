// biome-ignore-all lint: GSAP + View Transition API editorial layout showcase
"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ReactLenis } from "lenis/react";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

gsap.registerPlugin(useGSAP, SplitText);

export type TiltSlidePage = "home" | "projects" | "info";
/** @deprecated Use TiltSlidePage */
export type ViewPage = TiltSlidePage;

export interface TiltSlideTransitionNavItem {
  id: TiltSlidePage;
  label: string;
}
/** @deprecated Use TiltSlideTransitionNavItem */
export type ViewPageTransitionNavItem = TiltSlideTransitionNavItem;

const TILT_SLIDE_TRANSITION_STYLES = `
@import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");

.tst-root {
  --bg: #fff;
  --fg: #1a1a1a;
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  font-family: "PP Neue Montreal", sans-serif;
  background-color: #000;
  color: var(--fg);
}

.tst-root * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.tst-root ::-webkit-scrollbar {
  display: none;
}

.tst-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tst-root .navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}

.tst-root .navbar-items {
  display: flex;
  gap: clamp(1rem, 4vw, 2rem);
}

.tst-root .navbar-item {
  padding: 1.5rem;
}

.tst-root .navbar-item a,
.tst-root .navbar-item button {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  text-decoration: none;
  color: var(--fg);
  font-weight: 500;
  cursor: pointer;
}

.tst-root .home {
  width: 100%;
  height: 100svh;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
}

.tst-root .home h1 {
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  color: var(--fg);
  font-size: 20vw;
  font-weight: bolder;
  line-height: 1;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  margin: 0;
}

.tst-root .projects {
  width: 100%;
  height: 100svh;
  overflow-y: auto;
}

.tst-root .projects-container {
  width: 100%;
  min-height: 100svh;
  background-color: var(--bg);
  padding: 15rem 2rem;
}

.tst-root .images {
  width: 30%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tst-root .info {
  width: 100%;
  height: 100svh;
  overflow-y: auto;
  background-color: var(--bg);
}

.tst-root .info-container {
  width: 100%;
  min-height: 100svh;
  display: flex;
}

.tst-root .col {
  flex: 1;
}

.tst-root .col:nth-child(2) {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tst-root .col p {
  font-weight: 500;
  font-size: 2rem;
  color: var(--fg);
  margin: 0;
}

.tst-root .char,
.tst-root .line {
  position: relative;
  will-change: transform;
}

@media (max-width: 1000px) {
  .tst-root .navbar-logo {
    display: none;
  }

  .tst-root .navbar {
    justify-content: center;
  }

  .tst-root .images {
    width: calc(100% - 1rem);
  }

  .tst-root .info-container {
    flex-direction: column;
    min-height: 100svh;
  }

  .tst-root .col {
    flex: none;
    width: 100%;
  }

  .tst-root .col:first-child {
    height: 55vh;
    min-height: 300px;
  }

  .tst-root .col:nth-child(2) {
    align-items: flex-start;
    padding: 2.5rem 1.5rem 5rem;
  }

  .tst-root .col p {
    font-size: 1.25rem;
  }
}

::view-transition-group(navbar) {
  animation: none;
  z-index: 100;
}

::view-transition-old(.page-exit),
::view-transition-old(page-content) {
  animation: 1600ms cubic-bezier(0.65, 0, 0.35, 1) both page-out;
}

::view-transition-new(.page-enter),
::view-transition-new(page-content) {
  animation: 1500ms cubic-bezier(0.65, 0, 0.35, 1) both page-in;
  animation-delay: 0.25s;
}

@keyframes page-out {
  0% {
    transform: translateX(0%) translateY(0%) rotate(0deg) scale(1);
    opacity: 1;
  }
  40% {
    transform: translateX(0%) translateY(0%) rotate(0deg) scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: translateX(-50%) translateY(20%) rotate(-10deg) scale(0.65);
    opacity: 0.25;
  }
}

@keyframes page-in {
  from {
    transform: translateX(100%) translateY(20%);
    clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%);
  }
  to {
    transform: translateX(0%) translateY(0%);
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
`;

export interface TiltSlideTransitionHomeProps {
  className?: string;
  heroTitle?: string;
}

export function TiltSlideTransitionHome({
  className,
  heroTitle = "Sora",
}: TiltSlideTransitionHomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heroText = new SplitText(".home h1", {
        mask: "chars",
        type: "chars",
      });
      gsap.set(heroText.chars, { y: 400 });

      gsap.to(heroText.chars, {
        y: 0,
        duration: 1,
        stagger: 0.075,
        ease: "power3.out",
        delay: 1.125,
      });
    },
    { scope: containerRef }
  );

  return (
    <div className={cn("home", className)} ref={containerRef}>
      <h1>{heroTitle}</h1>
    </div>
  );
}

const TILT_SLIDE_MEDIA =
  "https://cdn.soralabs.studio/media/demo/tilt-slide-template" as const;

export interface TiltSlideTransitionProjectsProps {
  className?: string;
  images?: string[];
}

export function TiltSlideTransitionProjects({
  className,
  images = [
    `${TILT_SLIDE_MEDIA}/img1.jpg`,
    `${TILT_SLIDE_MEDIA}/img2.webp`,
    `${TILT_SLIDE_MEDIA}/img3.jpg`,
  ],
}: TiltSlideTransitionProjectsProps) {
  return (
    <ReactLenis
      className={cn("projects", className)}
      options={{ wrapper: undefined }}
    >
      <div className="projects-container">
        <div className="images">
          {images.map((src, index) => (
            <img alt={`Project item ${index + 1}`} key={src} src={src} />
          ))}
        </div>
      </div>
    </ReactLenis>
  );
}

export interface TiltSlideTransitionInfoProps {
  className?: string;
  image?: string;
  paragraph?: string;
}

export function TiltSlideTransitionInfo({
  className,
  image = `${TILT_SLIDE_MEDIA}/portrait.webp`,
  paragraph = "Sora is an open-source animated component distribution crafted with motion, typography, and tactile interaction design. Built for modern web applications, it bridges the gap between physics and interface with minimal, kinetic aesthetics.",
}: TiltSlideTransitionInfoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = new SplitText("p", {
        type: "lines",
        mask: "lines",
        linesClass: "line",
      });

      gsap.set(".line", { y: 400 });

      gsap.to(".line", {
        y: 0,
        duration: 2,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.5,
      });
    },
    { scope: containerRef }
  );

  return (
    <ReactLenis
      className={cn("info", className)}
      options={{ wrapper: undefined }}
    >
      <div className="info-container" ref={containerRef}>
        <div className="col">
          <img alt="Portrait" src={image} />
        </div>
        <div className="col">
          <p>{paragraph}</p>
        </div>
      </div>
    </ReactLenis>
  );
}

export interface TiltSlideTransitionNavbarProps {
  activePage: TiltSlidePage;
  brandName?: string;
  className?: string;
  navItems?: TiltSlideTransitionNavItem[];
  onNavigate: (page: TiltSlidePage) => void;
}

export function TiltSlideTransitionNavbar({
  activePage: _activePage,
  brandName = "Sora",
  className,
  navItems = [
    { id: "home", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "info", label: "Info" },
  ],
  onNavigate,
}: TiltSlideTransitionNavbarProps) {
  return (
    <nav
      className={cn("navbar", className)}
      style={{ viewTransitionName: "navbar" }}
    >
      <div className="navbar-logo">
        <div className="navbar-item">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("home");
            }}
          >
            {brandName}
          </a>
        </div>
      </div>
      <div className="navbar-items">
        {navItems.map((item) => (
          <div className="navbar-item" key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
}

export interface TiltSlideTransitionProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Logo/brand title displayed in the navbar. @default "Sora" */
  brandName?: string;
  /** Active page for uncontrolled usage. @default "home" */
  defaultPage?: TiltSlidePage;
  /** Large heading text revealed on the Home page. @default "Sora" */
  heroTitle?: string;
  /** Paragraph text revealed line-by-line on the Info page. */
  infoParagraph?: string;
  /** Navigation links rendered in the navbar. */
  navItems?: TiltSlideTransitionNavItem[];
  /** Callback fired when a page transition starts. */
  onPageChange?: (page: TiltSlidePage) => void;
  /** Controlled page state. */
  page?: TiltSlidePage;
  /** Portrait image URL shown on the Info page. */
  portraitImage?: string;
  /** Image URLs displayed in the Projects smooth scroll feed. */
  projectImages?: string[];
  /** Optional forwarded ref for the root container. */
  ref?: Ref<HTMLDivElement>;
}
/** @deprecated Use TiltSlideTransitionProps */
export type ViewPageTransitionProps = TiltSlideTransitionProps;

export function TiltSlideTransition({
  brandName = "Sora",
  className,
  defaultPage = "home",
  heroTitle = "Sora",
  infoParagraph,
  navItems,
  onPageChange,
  page: controlledPage,
  portraitImage,
  projectImages,
  ref,
  style,
  ...props
}: TiltSlideTransitionProps) {
  const [internalPage, setInternalPage] = useState<TiltSlidePage>(defaultPage);
  const activePage = controlledPage ?? internalPage;
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const styleId = "sora-tst-styles";
    if (document.getElementById(styleId)) {
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = TILT_SLIDE_TRANSITION_STYLES;
    document.head.appendChild(styleElement);
  }, []);

  const handleNavigate = useCallback(
    (targetPage: TiltSlidePage) => {
      if (targetPage === activePage || isTransitioningRef.current) {
        return;
      }

      onPageChange?.(targetPage);

      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        isTransitioningRef.current = true;
        try {
          const transition = document.startViewTransition(() => {
            flushSync(() => {
              setInternalPage(targetPage);
            });
          });

          transition.finished.finally(() => {
            isTransitioningRef.current = false;
          });
        } catch {
          setInternalPage(targetPage);
          isTransitioningRef.current = false;
        }
      } else {
        setInternalPage(targetPage);
      }
    },
    [activePage, onPageChange]
  );

  const renderActiveView = (): ReactNode => {
    switch (activePage) {
      case "projects":
        return <TiltSlideTransitionProjects images={projectImages} />;
      case "info":
        return (
          <TiltSlideTransitionInfo
            image={portraitImage}
            paragraph={infoParagraph}
          />
        );
      case "home":
      default:
        return <TiltSlideTransitionHome heroTitle={heroTitle} />;
    }
  };

  return (
    <div
      className={cn("tst-root", className)}
      ref={ref}
      style={style as CSSProperties}
      {...props}
    >
      <style>{TILT_SLIDE_TRANSITION_STYLES}</style>
      <TiltSlideTransitionNavbar
        activePage={activePage}
        brandName={brandName}
        navItems={navItems}
        onNavigate={handleNavigate}
      />
      <div
        className="page-content page-enter page-exit"
        style={{
          height: "100%",
          viewTransitionName: "page-content",
          width: "100%",
        }}
      >
        {renderActiveView()}
      </div>
    </div>
  );
}

export {
  TiltSlideTransition as ViewPageTransition,
  TiltSlideTransitionHome as ViewPageTransitionHome,
  TiltSlideTransitionInfo as ViewPageTransitionInfo,
  TiltSlideTransitionNavbar as ViewPageTransitionNavbar,
  TiltSlideTransitionProjects as ViewPageTransitionProjects,
};
