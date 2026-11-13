import { ExternalLinkIcon } from "lucide-react";

export const ExternalLink = ({
  href,
  text,
}: {
  href: string;
  text: string;
}) => (
  <a
    className="not-prose bg-muted text-muted-foreground hover:bg-muted/70 flex w-fit flex-row items-center rounded-md py-1 pr-2.5 pl-3 text-sm font-medium transition-colors duration-150 ease-out"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    <span>{text}</span>
    <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
  </a>
);
