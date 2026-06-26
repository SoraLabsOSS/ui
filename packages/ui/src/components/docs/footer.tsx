export const Footer = ({ lastUpdate }: { lastUpdate?: Date }) => (
  <div className="-mt-2 mb-7 flex w-full flex-col-reverse justify-between lg:flex-row lg:items-center lg:gap-2">
    <div className="prose prose-sm flex size-full items-center justify-start text-muted-foreground text-sm">
      <div className="flex items-center gap-2">
        <p className="truncate whitespace-normal text-start">
          Built by{" "}
          <a
            href="https://github.com/axyl1410/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Axyl
          </a>
          . A motion-first component registry for React.
        </p>
      </div>
    </div>

    {lastUpdate && (
      <p className="flex items-center gap-1 text-nowrap text-muted-foreground text-sm">
        Last updated:{" "}
        <span className="rounded-sm bg-accent px-1.5 py-[3px] font-medium text-[13px] text-foreground">
          {lastUpdate?.toLocaleDateString()}
        </span>
      </p>
    )}
  </div>
);
