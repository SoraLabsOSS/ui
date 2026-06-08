import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.cdnfonts.com/css/sf-pro-display"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
