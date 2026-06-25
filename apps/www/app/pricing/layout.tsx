import type { ReactNode } from "react";

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col antialiased">
      {children}
    </div>
  );
}
