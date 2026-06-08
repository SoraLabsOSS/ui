import { Features } from "@/components/features";
import { Hero } from "@/components/hero";

export function HomeHeroFeatures() {
  return (
    <section className="relative bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pt-30 pb-24 lg:pb-32">
        <Hero />
        <Features />
      </div>
    </section>
  );
}
