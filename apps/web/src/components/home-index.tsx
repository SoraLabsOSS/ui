import { AnimatedFooter } from "@/components/brand-landing/animated-footer";
import { Preloader } from "@/components/brand-landing/preloader";
import { PreloaderProvider } from "@/lib/brand-landing/preloader-context";

export function HomeIndex() {
  return (
    <PreloaderProvider>
      <main className="h-svh overflow-hidden">
        <Preloader />
        <AnimatedFooter />
      </main>
    </PreloaderProvider>
  );
}
