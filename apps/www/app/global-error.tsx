"use client";

import { captureException } from "@sentry/nextjs";
import { Button } from "@workspace/ui/components/ui/button";
import "./globals.css";
import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    captureException(error);

    // Detect dark theme from localStorage or system preferences
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (
      savedTheme === "dark" ||
      (savedTheme === "system" && systemPrefersDark) ||
      (!savedTheme && systemPrefersDark)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [error]);

  return (
    <html className="sf-pro-display" lang="en">
      <body className="bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <div className="relative flex min-h-screen flex-col items-center justify-center space-y-4 px-6 text-center">
          <h1 className="font-light font-mono text-7xl">500</h1>
          <p className="font-mono text-base text-zinc-500 dark:text-zinc-400">
            Something went wrong!
          </p>
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={() => unstable_retry()}>Try again</Button>
            <Button asChild variant="outline">
              <a
                href="https://github.com/SoraLabsOSS/sora-ui-community/issues/new"
                rel="noopener noreferrer"
                target="_blank"
              >
                Report issue
              </a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
