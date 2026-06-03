import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center space-y-4 bg-white px-6 text-center text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <h1 className="font-light font-mono text-7xl">404</h1>
      <p className="font-mono text-base text-zinc-500 dark:text-zinc-400">
        This page could not be found.
      </p>
      <div className="pt-4">
        <Link
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-zinc-50 shadow-sm outline-none transition-all hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:focus-visible:ring-zinc-300 dark:hover:bg-zinc-200"
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
