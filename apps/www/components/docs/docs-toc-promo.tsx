import { buttonVariants } from "@workspace/ui/components/ui/button";
import { cn } from "@workspace/ui/lib/utils";

export interface DocsTocPromoProps {
  /**
   * Extra classes merged into the wrapper.
   */
  className?: string;

  /**
   * Target of the sponsor button.
   *
   * @defaultValue 'https://github.com/sponsors/Axyl1410'
   */
  href?: string;
}

/**
 * Sponsor card rendered right below the TOC heading list.
 * Only the button navigates — the card itself is not a link.
 */
export function DocsTocPromo({
  className,
  href = "https://github.com/sponsors/Axyl1410",
}: DocsTocPromoProps) {
  return (
    <div className={cn("mt-6 flex flex-col gap-3", className)}>
      <div className="rounded-xl bg-surface p-6">
        <p className="font-medium text-xl leading-6 tracking-tight">
          Help keep SoraLabs moving.
        </p>
        <p className="mt-3 text-muted-foreground text-sm leading-tight">
          Every contribution helps us build and maintain open-source tools for
          the community.
        </p>
        <a
          className={cn(buttonVariants({ size: "sm" }), "mt-4")}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          Sponsor on GitHub
        </a>
      </div>
    </div>
  );
}
