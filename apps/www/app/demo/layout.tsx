import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Sora UI Demos",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}
