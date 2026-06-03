import { cn } from "@workspace/ui/lib/utils";

interface DocsAuthorProps {
  name: string;
  url?: string;
}

const nameClassName =
  "text-foreground underline underline-offset-2 decoration-primary font-medium";

export const DocsAuthor = ({ name, url }: DocsAuthorProps) => (
  <span className="mb-2.5 text-fd-muted-foreground text-sm italic">
    Made by{" "}
    {url ? (
      <a
        className={cn(
          nameClassName,
          "cursor-pointer hover:decoration-foreground"
        )}
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {name}
      </a>
    ) : (
      <span className={nameClassName}>{name}</span>
    )}
  </span>
);
