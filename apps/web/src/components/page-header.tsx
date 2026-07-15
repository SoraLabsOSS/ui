"use client";

import Link from "next/link";
import { useState } from "react";
import { NavPanel } from "@/components/work/nav-panel";
import { SITE_NAME } from "@/lib/site";

export function PageHeader({ crumb }: { crumb?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[51px] items-center justify-between border-[#1a1a1a] border-b bg-black px-[26px]">
        <div className="flex items-center gap-2 text-xs uppercase">
          <Link className="text-white tracking-[0.12em] no-underline" href="/">
            {SITE_NAME}
          </Link>
          {crumb ? (
            <>
              <span className="text-[#555] tracking-[0.04em]">/</span>
              <span className="text-[#555] tracking-[0.04em]">{crumb}</span>
            </>
          ) : null}
        </div>
        <button
          className="flex h-[31px] shrink-0 items-center gap-2 rounded-full bg-white pr-4 pl-3.5 font-medium text-[10px] text-black uppercase tracking-[0.12em]"
          data-cursor-hover
          onClick={() => setOpen(true)}
          type="button"
        >
          Menu
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-black" />
        </button>
      </header>
      <NavPanel onClose={() => setOpen(false)} open={open} />
    </>
  );
}
