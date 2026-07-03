import { index } from "@/__registry__";

type InspirationType = "inspired" | "reimplemented" | "adapted";

interface RegistryInspiration {
  label: string;
  stack?: string;
  type: InspirationType;
  url?: string;
}

interface ComponentCreditsProps {
  name: string;
}

function InspirationSource({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return <span className="font-medium text-foreground">{label}</span>;
  }

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
    const stack = inspiration.stack ?? "Motion and React";
    return (
      <>
        Inspired by {source}. Reimplemented for {stack}.
      </>
    );
  }

  if (inspiration.type === "adapted") {
    return (
      <>
        Adapted from {source}. Independent implementation for the Sora UI
        registry. Not affiliated with the original authors.
      </>
    );
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
