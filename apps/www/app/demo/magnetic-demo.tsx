"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { magneticCardsDemoItems } from "@/lib/demo/magnetic-cards-demo-items";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

import "./magnetic-demo.css";

gsap.registerPlugin(InertiaPlugin, ScrollTrigger);

const FLOATING_LABELS = [
  {
    className: "magnetic-demo__label--pink",
    text: "copy, don't install",
  },
  {
    className: "magnetic-demo__label--orange",
    text: "motion-first by default",
  },
  {
    className: "magnetic-demo__label--green",
    text: "built for shadcn",
  },
] as const;

const CARD_REST = [
  { rotation: -6 },
  { rotation: 6 },
  { rotation: -6 },
  { rotation: 4 },
] as const;

function attachInertia(
  el: HTMLElement,
  velocityMultiplier: number,
  rotationVelocityMultiplier: number
): () => void {
  let lastX = 0;
  let lastY = 0;
  let speedX = 0;
  let speedY = 0;

  const startRotation = Number(gsap.getProperty(el, "rotation"));
  const startX = Number(gsap.getProperty(el, "x"));
  const startY = Number(gsap.getProperty(el, "y"));

  const onMove = (event: MouseEvent) => {
    speedX = event.clientX - lastX;
    speedY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
  };

  const onEnter = (event: MouseEvent) => {
    speedX = 0;
    speedY = 0;
    lastX = event.clientX;
    lastY = event.clientY;
  };

  const onLeave = () => {
    gsap.to(el, {
      inertia: {
        rotation: {
          end: startRotation,
          velocity: speedX * rotationVelocityMultiplier,
        },
        x: { end: startX, velocity: speedX * velocityMultiplier },
        y: { end: startY, velocity: speedY * velocityMultiplier },
      },
    });
  };

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);

  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseenter", onEnter);
    el.removeEventListener("mouseleave", onLeave);
  };
}

export function MagneticDemoPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion) {
        return;
      }

      const cards = [
        ...section.querySelectorAll<HTMLElement>("[data-magnetic-card]"),
      ];
      const cardCleanups = cards.map((card, index) => {
        const rest = CARD_REST[index] ?? CARD_REST[0];
        gsap.set(card, { rotation: rest.rotation });
        return attachInertia(card, 20, 1.5);
      });

      const labelCleanups = [
        ...section.querySelectorAll<HTMLElement>("[data-magnetic-label]"),
      ].map((label) => attachInertia(label, 25, 2));

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      const sticker = section.querySelector<HTMLElement>(
        "[data-magnetic-sticker]"
      );
      if (sticker) {
        gsap.set(sticker, { scale: 0, opacity: 0, rotation: -30 });
        timeline.to(
          sticker,
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 1.7,
            ease: "elastic.out(1, 0.4)",
          },
          0
        );
      }

      const underline = section.querySelector<SVGPathElement>(
        "[data-magnetic-underline]"
      );
      if (underline) {
        const pathLen = underline.getTotalLength();
        gsap.set(underline, {
          strokeDasharray: pathLen,
          strokeDashoffset: pathLen,
        });
        timeline.to(
          underline,
          { strokeDashoffset: 0, duration: 1.5, ease: "power2.out" },
          0.2
        );
      }

      return () => {
        for (const cleanup of [...cardCleanups, ...labelCleanups]) {
          cleanup();
        }
      };
    },
    { dependencies: [prefersReducedMotion], scope: sectionRef }
  );

  return (
    <div className="magnetic-demo">
      <section className="magnetic-demo__section" ref={sectionRef}>
        <div className="magnetic-demo__heading">
          <h1 className="magnetic-demo__title">
            from ideas
            <br />
            to interfaces.
          </h1>
          <p className="magnetic-demo__subtitle">
            motion-first UI.
            <span className="magnetic-demo__sticker">
              <Image
                alt=""
                data-magnetic-sticker
                height={80}
                src="/demo/magnetic/sticker-hands.svg"
                width={150}
              />
            </span>
          </p>
          <svg
            aria-hidden="true"
            className="magnetic-demo__underline"
            fill="none"
            viewBox="0 0 634 28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 26C41.0237 23.1556 79.9927 19.9419 118.634 15.5521C169.106 9.98633 227.314 2.42393 275.206 2C280.46 2.57436 264.768 4.99488 262.462 5.55556C257.837 6.43078 252.529 7.47009 247.317 8.59146C239.594 10.3556 212.496 15.8393 226.932 19.8051C239.594 22.6359 263.663 21.9521 280.978 21.3504C314.817 19.9829 349.311 16.7419 383.204 14.7863C465.931 9.5077 549.191 10.547 632 14.1436"
              data-magnetic-underline
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </svg>
        </div>

        <div className="magnetic-demo__cards-area">
          <div aria-hidden className="magnetic-demo__blob">
            <Image
              alt=""
              height={526}
              src="/demo/magnetic/blob.svg"
              width={527}
            />
          </div>

          <div className="magnetic-demo__cards">
            {magneticCardsDemoItems.map((item, index) => (
              <div
                className={`magnetic-demo__card magnetic-demo__card--${index + 1}`}
                data-magnetic-card
                key={item.src}
              >
                <div className="magnetic-demo__card-image">
                  <Image
                    alt={item.alt ?? ""}
                    className="magnetic-demo__cover"
                    fill
                    sizes="17vw"
                    src={item.src}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="magnetic-demo__labels">
            {FLOATING_LABELS.map((label) => (
              <div
                className={`magnetic-demo__label ${label.className}`}
                data-magnetic-label
                key={label.text}
              >
                <p>{label.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="magnetic-demo__footer">
          <p className="magnetic-demo__description">
            Sora UI is a motion-first React component registry — animated
            primitives you copy into your codebase, built on Tailwind and
            Motion, designed to drop into any shadcn/ui project.
          </p>
        </div>
      </section>
    </div>
  );
}
