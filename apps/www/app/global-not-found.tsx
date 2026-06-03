// Import global styles and fonts
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html className={inter.className} lang="en">
      <body className="bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <div className="relative flex min-h-screen flex-col items-center justify-center space-y-4 px-6 text-center">
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
      </body>
    </html>
  );
}
