import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LegalNav } from "./legal-nav";

export function LegalPageHeader() {
  return (
    <header className="mb-10 lg:mb-14">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
          Legal
        </p>
        <Link
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-foreground hover:bg-muted"
          href="/"
        >
          <ArrowLeft aria-hidden className="size-5" />
          <span className="ml-2 text-sm">Back to home</span>
        </Link>
      </div>
      <LegalNav />
    </header>
  );
}
