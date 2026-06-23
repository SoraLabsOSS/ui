"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEGAL_NAV_ITEMS } from "./legal-nav-config";

function isActivePath(pathname: string, href: string) {
  if (href.startsWith("/docs/")) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LegalNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Legal pages"
      className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-foreground/10 border-t pt-4"
    >
      {LEGAL_NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            className={cn(
              "font-mono text-xs uppercase tracking-widest transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
