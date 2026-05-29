'use client';

import { Button } from '@workspace/ui/components/ui/button';
import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);

    // Detect dark theme from localStorage or system preferences
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    if (
      savedTheme === 'dark' ||
      (savedTheme === 'system' && systemPrefersDark) ||
      (!savedTheme && systemPrefersDark)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [error]);

  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <div className="relative flex min-h-screen flex-col items-center justify-center space-y-4 px-6 text-center">
          <h1 className="font-mono text-7xl font-light">500</h1>
          <p className="font-mono text-base text-zinc-500 dark:text-zinc-400">
            Something went wrong!
          </p>
          <div className="pt-4">
            <Button onClick={() => unstable_retry()}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
