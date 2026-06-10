import { cn } from "@workspace/ui/lib/utils";
import type { ComponentPageHeaderData } from "@/lib/registry/types";

interface ComponentPageMetaProps {
  className?: string;
  data: Pick<ComponentPageHeaderData, "dependencies" | "registryDependencies">;
}

function DependencyBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 font-mono text-[0.7rem] text-foreground/80">
      {name}
    </span>
  );
}

export function ComponentPageMeta({ data, className }: ComponentPageMetaProps) {
  const allDependencies = [
    ...data.dependencies,
    ...data.registryDependencies,
  ].filter(Boolean);

  if (allDependencies.length === 0) {
    return null;
  }

  return (
    <section className={cn("flex flex-col gap-2.5", className)}>
      <p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
        Dependencies
      </p>
      <div className="flex flex-wrap gap-2">
        {allDependencies.map((dependency) => (
          <DependencyBadge key={dependency} name={dependency} />
        ))}
      </div>
    </section>
  );
}
