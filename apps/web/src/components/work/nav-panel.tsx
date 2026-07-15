"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmailCopy } from "@/components/home/email-copy";
import { CONTACT_EMAIL, NAV_ITEMS, SOCIAL_LINKS } from "@/lib/home/content";

const PANEL_NAV_ITEMS = [{ href: "/", label: "Home" }, ...NAV_ITEMS];

function NavRow({
  disabled,
  hasHover,
  hovered,
  href,
  label,
  onEnter,
  onLeave,
}: {
  disabled?: boolean;
  hasHover: boolean;
  hovered: boolean;
  href: string;
  label: string;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const textClass =
    "block font-normal text-[clamp(38px,6vw,64px)] leading-none";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${textClass} border-[#1a1a1a] border-b py-2 text-white opacity-35`}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      className={`relative border-[#1a1a1a] border-b py-2 no-underline transition-opacity duration-200 ${
        hasHover && !hovered ? "opacity-15" : "opacity-100"
      }`}
      data-cursor-hover
      href={href}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span className={`${textClass} h-[1.2em] overflow-hidden text-white`}>
        <span
          className={`flex flex-col transition-transform duration-[420ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
            hovered ? "-translate-y-1/2" : "translate-y-0"
          }`}
        >
          <span className="block leading-[1.2]">{label}</span>
          <span className="block leading-[1.2]">{label}</span>
        </span>
      </span>
    </Link>
  );
}

export function NavPanel({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const [clock, setClock] = useState("00:00:00");
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    // Locks background scroll so the underlying page (and its footer) can't
    // shift under the panel while it's open — that shift is what let the
    // footer peek through below the panel on mobile.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] flex w-full max-w-[460px] flex-col border-[#1a1a1a] border-l bg-[#0a0a0a] p-6 py-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-10 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center">
          <span className="text-[#444] text-[10px] uppercase tracking-[0.12em]">
            {clock}
          </span>
          <button
            aria-label="Close"
            className="relative ml-auto flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#1a1a1a] transition-colors hover:bg-[#282828]"
            data-cursor-hover
            onClick={onClose}
            type="button"
          >
            <span className="absolute h-0.5 w-3 rotate-45 rounded-full bg-white" />
            <span className="absolute h-0.5 w-3 -rotate-45 rounded-full bg-white" />
          </button>
        </div>

        <nav className="my-auto flex flex-col py-7">
          {PANEL_NAV_ITEMS.map((item) => (
            <NavRow
              disabled={"disabled" in item ? item.disabled : false}
              hasHover={hoveredLabel !== null}
              hovered={hoveredLabel === item.label}
              href={item.href}
              key={item.label}
              label={item.label}
              onEnter={() => setHoveredLabel(item.label)}
              onLeave={() => setHoveredLabel(null)}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-6 border-[#1a1a1a] border-t pt-6 sm:flex-row sm:items-end sm:justify-between">
          <EmailCopy email={CONTACT_EMAIL} />
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#333] text-[#999] text-[9px] uppercase tracking-[0.06em] no-underline transition-colors hover:border-[#555] hover:text-white"
                data-cursor-hover
                href={social.href}
                key={social.label}
                rel="noopener noreferrer"
                target="_blank"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
