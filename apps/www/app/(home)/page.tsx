"use client";

import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function HomePage() {
  return (
    <main
      className="relative z-0 h-[calc(100dvh-var(--fd-banner-height,0px))] overflow-y-auto overflow-x-hidden"
      id="home-page"
    >
      <Header />
      <div className="flex min-h-full w-full flex-col justify-between">
        <div>
          <Hero />
          <Features />
        </div>
        <Footer />
      </div>
    </main>
  );
}
