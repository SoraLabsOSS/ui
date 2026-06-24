import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Cursor Trail Reveal Demo",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}
