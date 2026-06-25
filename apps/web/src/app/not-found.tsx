import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center space-y-4 bg-background px-6 text-center text-foreground">
      <h1 className="font-light font-mono text-7xl">404</h1>
      <p className="font-mono text-base text-muted-foreground">
        This page could not be found.
      </p>
      <div className="pt-4">
        <Link
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-foreground px-4 py-2 font-medium text-background text-sm shadow-sm outline-none transition-all hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
