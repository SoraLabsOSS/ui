import { Hero } from "@/components/hero";
import { HomeShell } from "@/components/home/home-shell";

export function HomeHeroFeatures() {
  return (
    <section className="relative flex min-h-[calc(100dvh-var(--fd-banner-height)-4rem)] items-center justify-center overflow-hidden text-foreground">
      <HomeShell className="relative z-10 w-full">
        <Hero />
      </HomeShell>
    </section>
  );
}
