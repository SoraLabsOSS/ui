"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/docs", label: "Docs" },
  {
    href: "https://github.com/axyl1410/sora",
    label: "GitHub",
    external: true,
  },
] as const;

export function LegalPageFooter() {
  return (
    <footer className="relative mt-16 border-foreground/10 border-t pt-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
          {FOOTER_LINKS.map((link, index) => {
            const isExternal = "external" in link && link.external === true;

            return (
              <span className="flex items-center" key={link.href}>
                {isExternal ? (
                  <a
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground/50 transition-colors hover:text-foreground/80"
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground/50 transition-colors hover:text-foreground/80"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                )}
                {index < FOOTER_LINKS.length - 1 ? (
                  <span className="mx-1 select-none text-[10px] text-foreground/10">
                    /
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-foreground/50">
          © {new Date().getFullYear()} Sora UI
        </span>
      </div>
    </footer>
  );
}
