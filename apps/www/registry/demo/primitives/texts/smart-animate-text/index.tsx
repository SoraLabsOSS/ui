"use client";

import { useState } from "react";
import { SmartAnimateText } from "@/registry/primitives/texts/smart-animate-text";

function randomPrice() {
  return (Math.random() * 900 + 100).toFixed(0);
}

export default function SmartAnimateTextExample() {
  const [price, setPrice] = useState("182.34");

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-baseline gap-1 font-semibold text-4xl">
        <SmartAnimateText value={price} />
      </div>
      <button
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        onClick={() => setPrice(randomPrice())}
        type="button"
      >
        Randomize price
      </button>
    </div>
  );
}
