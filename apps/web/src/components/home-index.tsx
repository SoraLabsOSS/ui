import { AnimatedFooter } from "@/components/brand-landing/animated-footer";
import { Preloader } from "@/components/brand-landing/preloader";

export function HomeIndex() {
  return (
    <main className="h-svh overflow-hidden">
      <Preloader />
      <AnimatedFooter />
    </main>
  );
}
