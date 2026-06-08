import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./sf-pro-display.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children;
}
