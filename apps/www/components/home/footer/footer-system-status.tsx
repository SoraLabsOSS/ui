export function FooterSystemStatus() {
  return (
    <div className="flex items-center gap-4">
      <div className="group flex cursor-default items-center gap-2">
        <div aria-hidden className="relative flex size-2">
          <span
            aria-hidden
            className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"
          />
          <span
            aria-hidden
            className="relative inline-flex size-2 rounded-full bg-emerald-500"
          />
        </div>
        <span className="text-muted-foreground text-sm transition-colors group-hover:text-foreground">
          All systems normal
        </span>
      </div>
    </div>
  );
}
