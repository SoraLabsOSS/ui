import { ExternalLinkIcon } from "lucide-react";

export const ExternalLink = ({
  href,
  text,
}: {
  href: string;
  text: string;
}) => (
  <a
    className="not-prose flex w-fit flex-row items-center rounded-md bg-muted py-1 pr-2.5 pl-3 font-medium text-muted-foreground text-sm transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted/70 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    <span>{text}</span>
    <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
  </a>
);
