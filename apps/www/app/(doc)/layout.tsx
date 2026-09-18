import type { ReactNode } from "react";
import { AISearchRoot } from "@/components/ai/shell";
import { Providers } from "@/components/providers";

export default function DocLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {children}
      <AISearchRoot />
    </Providers>
  );
}
