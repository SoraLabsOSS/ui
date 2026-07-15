"use client";

import { useEffect, useState } from "react";

export function WorkFooter({
  fixedOnDesktop,
}: {
  /** Pins the footer to the viewport bottom at desktop widths (matches
   * `about.html`'s `colors_and_type.css` behaviour); stays in normal document
   * flow on mobile to avoid jank with the browser address-bar animation. */
  fixedOnDesktop?: boolean;
}) {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Ho_Chi_Minh",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer
      className={`mt-auto border-[#1a1a1a] border-t bg-black ${
        fixedOnDesktop ? "lg:fixed lg:inset-x-0 lg:bottom-0 lg:z-50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-7">
        <span className="text-[#555] text-[10px] uppercase tracking-[0.08em]">
          2024 – 2026 ©
        </span>
        <span className="text-[#555] text-[10px] uppercase tracking-[0.08em] max-sm:hidden">
          {clock}
        </span>
        <span className="text-[#555] text-[10px] uppercase tracking-[0.08em]">
          Built in Vietnam
        </span>
      </div>
    </footer>
  );
}
