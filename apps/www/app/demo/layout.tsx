import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./demo.css";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Text Reveal Block Demo",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <div className="text-reveal-demo">{children}</div>;
}
