const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function BlogBanner() {
  return (
    <div className="relative mb-3.5 flex animate-fade-in-up flex-col justify-end overflow-hidden border border-[#1a1a1a] bg-black p-8 sm:aspect-[3.2] sm:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 blur-xl"
        style={{
          background:
            "linear-gradient(115deg, transparent 38%, color-mix(in oklab, var(--color-accent-brand) 85%, transparent) 48%, color-mix(in oklab, var(--color-accent-brand) 85%, transparent) 52%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{ backgroundImage: GRAIN_URL }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
      <div className="relative">
        <h1 className="font-normal text-2xl text-white sm:text-3xl">Blog</h1>
        <p className="mt-2 text-[#999] text-[13px]">
          Notes on this site, its stack, and what changes.
        </p>
      </div>
    </div>
  );
}
