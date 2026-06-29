import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoLenis } from "./demo-lenis";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Sora UI Demos",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoLenis>{children}</DemoLenis>;
}
