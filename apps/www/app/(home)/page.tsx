"use client";

import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeLenis } from "@/components/home/home-lenis";
import { HomeTwoWays } from "@/components/home/home-two-ways";
import { WhoItsFor } from "@/components/home/who-its-for";

export default function HomePage() {
  return (
    <HomeLenis>
      <Header />
      <div className="flex min-h-full w-full flex-col justify-between">
        <div>
          <Hero />
          <Features />
          <WhoItsFor />
          <HomeTwoWays />
          <HomeFaq />
        </div>
        <Footer />
      </div>
    </HomeLenis>
  );
}
