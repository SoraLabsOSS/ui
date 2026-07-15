import Link from "next/link";
import { NAV_ITEMS } from "@/lib/home/content";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto] border-[#1a1a1a] border-b bg-black lg:grid-cols-[360px_1fr_300px]">
      <div className="flex items-center border-[#1a1a1a] border-r px-[26px] py-4">
        <Link
          className="text-white text-xs uppercase tracking-[0.12em] no-underline transition-opacity hover:opacity-50"
          href="/"
        >
          {SITE_NAME}
        </Link>
      </div>
      <div className="flex items-center justify-between gap-4 px-[26px] py-4 lg:border-[#1a1a1a] lg:border-r">
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span
              aria-disabled="true"
              className="pointer-events-none text-[#555] text-[11px] uppercase tracking-[0.04em] opacity-35"
              key={item.label}
            >
              {item.label}
            </span>
          ) : (
            <Link
              className="text-[11px] text-white uppercase tracking-[0.04em] no-underline transition-colors"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          )
        )}
      </div>
      <div className="hidden items-center px-[26px] py-4 lg:flex">
        <span className="text-[#555] text-[11px] uppercase tracking-[0.04em]">
          CV (Sample)
        </span>
      </div>
    </header>
  );
}
