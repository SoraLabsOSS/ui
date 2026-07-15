"use client";

import { useState } from "react";

export function ShareButton({ url }: { url: string }) {
  const [label, setLabel] = useState("Share");

  async function handleClick() {
    const shareUrl = `${window.location.origin}${url}`;

    if (navigator.share) {
      await navigator.share({ url: shareUrl }).catch(() => null);
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setLabel("Copied ✓");
    setTimeout(() => setLabel("Share"), 1500);
  }

  return (
    <button
      className="rounded-full border border-[#333] px-3.5 py-1.5 text-[10px] text-white uppercase tracking-[0.08em] transition-colors hover:border-[#555]"
      data-cursor-hover
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  );
}
