"use client";

import { useRef, useState } from "react";

export function EmailCopy({ email }: { email: string }) {
  const [label, setLabel] = useState("Click to copy");
  const [visible, setVisible] = useState(false);
  const tipRef = useRef<HTMLSpanElement>(null);

  function moveTip(e: React.MouseEvent) {
    const tip = tipRef.current;
    if (!tip) {
      return;
    }
    tip.style.left = `${e.clientX}px`;
    tip.style.top = `${e.clientY - 44}px`;
  }

  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setLabel("Copied ✓");
  }

  return (
    <span
      className="inline-flex cursor-pointer items-center gap-1.5 text-xs"
      data-cursor-hover
      onClick={handleClick}
      onMouseEnter={(e) => {
        moveTip(e);
        setVisible(true);
      }}
      onMouseLeave={() => {
        setVisible(false);
        if (copied) {
          setTimeout(() => {
            setLabel("Click to copy");
            setCopied(false);
          }, 300);
        }
      }}
      onMouseMove={moveTip}
    >
      <span aria-hidden>📮</span>
      <span className="text-[#555] transition-colors hover:text-white">
        {email}
      </span>
      <span
        className={`pointer-events-none fixed top-0 left-0 z-[99999] whitespace-nowrap rounded-full bg-white px-2.5 py-1 font-medium text-[9px] text-black uppercase tracking-wider transition-opacity duration-150 ${
          visible ? (copied ? "opacity-90" : "opacity-45") : "opacity-0"
        }`}
        ref={tipRef}
      >
        {label}
      </span>
    </span>
  );
}
