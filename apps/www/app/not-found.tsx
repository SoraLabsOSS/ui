import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center space-y-4 bg-white px-6 text-center text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <h1 className="font-mono text-7xl font-light">404</h1>
      <p className="font-mono text-base text-zinc-500 dark:text-zinc-400">
        This page could not be found.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-50 shadow-sm transition-all outline-none hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
