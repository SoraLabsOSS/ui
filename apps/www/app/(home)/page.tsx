"use client";

import { useEffect, useState } from "react";
import { Footer } from "./components/footer";
import { Hero } from "./components/hero";
import { InfoSection } from "./components/info-section";
import { AboutModal } from "./components/modals/about-modal";
import { Navbar } from "./components/navbar";
import { UnderNavMarquee } from "./components/under-nav-marquee";
import { useButton3DHover } from "./hooks/use-button-3d-hover";
import { useLenisSmoothScroll } from "./hooks/use-lenis-smooth-scroll";

export default function HomePage() {
  const lenisRef = useLenisSmoothScroll();
  useButton3DHover();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollingStarted, setIsScrollingStarted] = useState(false);
  const [scrollingDirection, setScrollingDirection] = useState<"up" | "down">(
    "up"
  );
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Monitor scroll state for Navbar & Marquee morphing
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingStarted(currentScrollY > 30);

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setScrollingDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollingDirection("up");
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock/Unlock scroll when menu or modal is open
  useEffect(() => {
    if (isMenuOpen || isAboutModalOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [isMenuOpen, isAboutModalOpen, lenisRef]);

  return (
    <div className="home-content body" data-barba="wrapper">
      <Navbar
        isMenuOpen={isMenuOpen}
        isScrollingStarted={isScrollingStarted}
        onCloseMenu={() => setIsMenuOpen(false)}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        scrollingDirection={scrollingDirection}
      />

      <main
        className="main"
        data-barba="container"
        data-barba-namespace="home"
        data-page-theme="light"
      >
        <UnderNavMarquee
          isMenuOpen={isMenuOpen}
          isScrollingStarted={isScrollingStarted}
        />
        <Hero />
        <InfoSection />
      </main>

      <Footer onOpenAboutModal={() => setIsAboutModalOpen(true)} />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
