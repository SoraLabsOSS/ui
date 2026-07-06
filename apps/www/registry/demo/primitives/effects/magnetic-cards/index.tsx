"use client";

import { magneticCardsDemoItems } from "@/lib/demo/magnetic-cards-demo-items";
import { MagneticCards } from "@/registry/primitives/effects/magnetic-cards";

export function MagneticCardsExample() {
  return (
    <div className="h-[min(420px,60dvh)] w-full min-w-0 sm:h-[460px]">
      <MagneticCards className="h-full w-full" items={magneticCardsDemoItems} />
    </div>
  );
}

export default MagneticCardsExample;
