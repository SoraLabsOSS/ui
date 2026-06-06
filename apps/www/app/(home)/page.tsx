"use client";

import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <Header />
      <div className="flex w-full flex-col justify-between">
        <div>
          <Hero />
          <Features />
        </div>
        <Footer />
      </div>
    </main>
  );
}
