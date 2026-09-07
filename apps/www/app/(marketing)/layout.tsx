import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { HomeProviders } from "@/components/home-providers";
import { Navbar } from "@/components/navbar";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <HomeProviders>
      <div className="flex min-h-screen flex-col antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </HomeProviders>
  );
}
