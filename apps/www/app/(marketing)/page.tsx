"use client";

import { Hero } from "./components/hero";
import { InfoSection } from "./components/info-section";

export default function HomePage() {
  return (
    <div className="home-layout home-content body" data-barba="wrapper">
      <main
        className="main"
        data-barba="container"
        data-barba-namespace="home"
        data-page-theme="light"
      >
        <Hero />
        <InfoSection />
      </main>
    </div>
  );
}
