import { Hero } from "@/components/hero";

export function HomeHeroFeatures() {
  return (
    <section className="relative flex min-h-[calc(100dvh-var(--fd-banner-height)-4rem)] items-center justify-center overflow-hidden px-5 text-foreground">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <Hero />
      </div>
    </section>
  );
}
