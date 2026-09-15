import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { HomeProviders } from "@/components/home-providers";
import { Navbar } from "@/components/navbar";
import { fontBrisaPro } from "@/lib/fonts";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <HomeProviders>
      <div
        className={cn(
          "flex min-h-screen flex-col antialiased",
          fontBrisaPro.variable
        )}
      >
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </HomeProviders>
  );
}
