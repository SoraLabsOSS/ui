import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sf-pro-display min-h-full antialiased">{children}</div>
  );
}
