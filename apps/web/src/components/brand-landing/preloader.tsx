"use client";

import "./preloader.css";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";
import { revealAnimatedFooter } from "@/lib/brand-landing/animated-footer-engine";
import {
  completeInitialLoad,
  isInitialLoad,
} from "@/lib/brand-landing/preloader-state";

gsap.registerPlugin(useGSAP, SplitText);

const EXIT_DURATION = 1.25;

interface FooterElements {
  content: Element;
  footer: HTMLElement;
  leftSlot: Element;
  rightSlot: Element;
}

interface PartialFooterElements {
  content?: Element | null;
  footer?: HTMLElement;
  leftSlot?: Element | null;
  rightSlot?: Element | null;
}

function getFooterElements(): PartialFooterElements {
  const footer = document.querySelector("footer");
  if (!(footer instanceof HTMLElement)) {
    return {};
  }

  return {
    footer,
    content: document.querySelector(".footer-content"),
    leftSlot: document.querySelector(".footer-hand-slot--left"),
    rightSlot: document.querySelector(".footer-hand-slot--right"),
  };
}

function isFooterReady(
  elements: PartialFooterElements
): elements is FooterElements {
  return Boolean(
    elements.footer &&
      elements.content &&
      elements.leftSlot &&
      elements.rightSlot
  );
}

function waitForFooterElements(callback: (elements: FooterElements) => void) {
  let attempts = 0;
  const maxAttempts = 60;

  const tryResolve = () => {
    const elements = getFooterElements();
    if (isFooterReady(elements)) {
      callback(elements);
      return;
    }

    attempts += 1;
    if (attempts < maxAttempts) {
      requestAnimationFrame(tryResolve);
    }
  };

  tryResolve();
}

function setFooterStartState(elements: FooterElements) {
  gsap.set(elements.content, { y: 300, force3D: true });
}

function splitTextIntoLines(scope: HTMLElement, selector: string) {
  const element = scope.querySelector(selector);
  if (!element) {
    return null;
  }

  return SplitText.create(element, {
    type: "lines",
    mask: "lines",
    linesClass: "line",
  });
}

function animateCounter(
  scope: HTMLElement,
  selector: string,
  duration = 4.5,
  delay = 2
) {
  const counterElement = scope.querySelector(selector);
  if (!counterElement) {
    return;
  }

  let currentValue = 0;
  const updateInterval = 200;
  const maxDuration = duration * 1000;
  const startTime = Date.now();

  const timeoutId = window.setTimeout(() => {
    const updateCounter = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / maxDuration;

      if (currentValue < 100 && elapsedTime < maxDuration) {
        const target = Math.floor(progress * 100);
        const jump = Math.floor(Math.random() * 25) + 5;
        currentValue = Math.min(currentValue + jump, target, 100);
        counterElement.textContent = currentValue.toString().padStart(2, "0");
        window.setTimeout(updateCounter, updateInterval + Math.random() * 100);
      } else {
        counterElement.textContent = "100";
      }
    };

    updateCounter();
  }, delay * 1000);

  return () => window.clearTimeout(timeoutId);
}

export function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);

  useEffect(() => {
    if (!showPreloader) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      completeInitialLoad();
      setShowPreloader(false);
    }
  }, [showPreloader]);

  useEffect(
    () => () => {
      completeInitialLoad();
    },
    []
  );

  useGSAP(
    () => {
      if (!showPreloader) {
        return;
      }

      const scope = preloaderRef.current;
      if (!scope) {
        return;
      }

      let footerElements: FooterElements | null = null;
      let timeline: gsap.core.Timeline | null = null;
      let clearCounter: (() => void) | undefined;
      const copySplits: SplitText[] = [];

      waitForFooterElements((elements) => {
        footerElements = elements;
        setFooterStartState(elements);

        const revealer = scope.querySelector(".preloader-revealer");
        gsap.set(revealer, {
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          scale: 0,
          transform: "none",
        });

        for (const selector of [
          ".preloader-copy-col:first-child p",
          ".preloader-copy-col:last-child p",
          ".preloader-counter p",
        ]) {
          const split = splitTextIntoLines(scope, selector);
          if (split) {
            copySplits.push(split);
          }
        }

        const lineEls = copySplits.flatMap((split) => split.lines);

        if (lineEls.length > 0) {
          gsap.set(lineEls, { y: "100%" });
        }

        scope.classList.add("is-copy-ready");

        clearCounter = animateCounter(scope, ".preloader-counter p", 4.5, 2);

        timeline = gsap.timeline({
          onComplete: () => {
            window.setTimeout(() => {
              setShowPreloader(false);
            }, 100);
          },
        });

        timeline
          .to(lineEls, {
            y: "0%",
            duration: 1,
            stagger: 0.075,
            ease: "power3.out",
            delay: 1,
          })
          .to(
            revealer,
            {
              scale: 0.1,
              duration: 0.75,
              ease: "power2.out",
            },
            "<"
          )
          .to(revealer, {
            scale: 0.25,
            duration: 1,
            ease: "power3.out",
          })
          .to(revealer, {
            scale: 0.5,
            duration: 0.75,
            ease: "power3.out",
          })
          .to(revealer, {
            scale: 0.75,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(revealer, {
            scale: 1,
            duration: 1,
            ease: "power3.out",
          })
          .to(
            scope,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: EXIT_DURATION,
              ease: "power3.out",
            },
            "-=1"
          )
          .add(
            () =>
              revealAnimatedFooter(elements.footer, {
                duration: EXIT_DURATION,
              }),
            "<"
          )
          .to(
            elements.content,
            {
              y: 0,
              duration: EXIT_DURATION,
              ease: "power3.out",
            },
            "<"
          );
      });

      return () => {
        clearCounter?.();
        timeline?.kill();
        scope.classList.remove("is-copy-ready");
        for (const split of copySplits) {
          split.revert();
        }

        if (footerElements) {
          gsap.killTweensOf([footerElements.content]);
        }
      };
    },
    { scope: preloaderRef, dependencies: [showPreloader] }
  );

  if (!showPreloader) {
    return null;
  }

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="preloader-revealer" />

      <div className="preloader-copy">
        <div className="preloader-copy-col">
          <p>From ideas to interfaces.</p>
        </div>
        <div className="preloader-copy-col">
          <p>Animated components and reusable UI systems for developers.</p>
        </div>
      </div>

      <div className="preloader-counter">
        <p>00</p>
      </div>
    </div>
  );
}
