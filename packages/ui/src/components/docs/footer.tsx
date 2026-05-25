export const Footer = ({ lastUpdate }: { lastUpdate?: Date }) => {
  return (
    <div className="-mt-2 mb-7 flex w-full flex-col-reverse justify-between lg:flex-row lg:items-center lg:gap-2">
      <div className="prose prose-sm text-muted-foreground flex size-full items-center justify-start text-sm">
        <div className="flex items-center gap-2">
          <p className="truncate text-start whitespace-normal">
            Built by{' '}
            <a
              href="https://github.com/Axyl1410"
              rel="noopener noreferrer"
              target="_blank"
            >
              Axyl
            </a>
            . The source code will be available on GitHub soon.
          </p>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-muted-foreground flex items-center gap-1 text-sm text-nowrap">
          Last updated:{' '}
          <span className="text-foreground bg-accent rounded-sm px-1.5 py-[3px] text-[13px] font-medium">
            {lastUpdate?.toLocaleDateString()}
          </span>
        </p>
      )}
    </div>
  );
};
