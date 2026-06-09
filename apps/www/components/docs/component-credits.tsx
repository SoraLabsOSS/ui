import { index } from "@/__registry__";

type InspirationType = "inspired" | "reimplemented";

interface RegistryInspiration {
  label: string;
  type: InspirationType;
  url: string;
}

interface ComponentCreditsProps {
  name: string;
}

function InspirationSource({ label, url }: { label: string; url: string }) {
  return (
    <a
      className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-foreground/80"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function getInspirationText(inspiration: RegistryInspiration) {
  const source = (
    <InspirationSource label={inspiration.label} url={inspiration.url} />
  );

  if (inspiration.type === "reimplemented") {
    return <>Inspired by {source}. Reimplemented for Motion and React.</>;
  }

  return <>Inspired by {source}.</>;
}

export function ComponentCredits({ name }: ComponentCreditsProps) {
  const inspiration = (
    index as Record<string, { inspiration?: RegistryInspiration | null }>
  )[name]?.inspiration;

  if (!inspiration) {
    return null;
  }

  return (
    <p className="text-fd-muted-foreground text-sm leading-relaxed">
      {getInspirationText(inspiration)}
    </p>
  );
}
