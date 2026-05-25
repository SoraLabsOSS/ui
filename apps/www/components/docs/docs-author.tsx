import { cn } from '@workspace/ui/lib/utils';

interface DocsAuthorProps {
  name: string;
  url?: string;
}

const nameClassName =
  'text-foreground underline underline-offset-2 decoration-primary font-medium';

export const DocsAuthor = ({ name, url }: DocsAuthorProps) => {
  return (
    <span className="text-fd-muted-foreground mb-2.5 text-sm italic">
      Made by{' '}
      {url ? (
        <a
          className={cn(
            nameClassName,
            'hover:decoration-foreground cursor-pointer',
          )}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
      ) : (
        <span className={nameClassName}>{name}</span>
      )}
    </span>
  );
};
