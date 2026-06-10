import type { ReactNode } from "react";
import { ComponentsExperimentalGate } from "@/components/catalog/components-experimental-gate";
import { ComponentsShell } from "@/components/catalog/components-shell";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ComponentsShell>
      <ComponentsExperimentalGate>{children}</ComponentsExperimentalGate>
    </ComponentsShell>
  );
}
