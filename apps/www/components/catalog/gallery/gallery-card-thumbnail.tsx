"use client";

import { cn } from "@workspace/ui/lib/utils";

const TAG_GRADIENTS: Record<string, string> = {
  texts: "from-amber-500/15 via-orange-500/8 to-transparent",
  buttons: "from-pink-500/15 via-rose-500/8 to-transparent",
  effects: "from-cyan-500/15 via-sky-500/8 to-transparent",
  disclosure: "from-violet-500/15 via-blue-500/8 to-transparent",
  components: "from-emerald-500/15 via-teal-500/8 to-transparent",
};

function getTagGradient(tag: string | undefined): string {
  const key = (tag ?? "components").toLowerCase();
  return TAG_GRADIENTS[key] ?? TAG_GRADIENTS.components;
}

interface GalleryCardThumbnailProps {
  category?: string;
  className?: string;
  title: string;
}

export function GalleryCardThumbnail({
  category,
  className,
  title,
}: GalleryCardThumbnailProps) {
  const gradient = getTagGradient(category);
  const hue =
    title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br bg-muted/60",
        gradient,
        className
      )}
    >
      <div
        className="absolute -top-8 -right-8 h-40 w-40 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: `hsl(${hue} 65% 60%)` }}
      />
      <div
        className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: `hsl(${(hue + 60) % 360} 55% 55%)` }}
      />
      <span className="relative z-10 max-w-[75%] text-center font-semibold text-foreground/30 text-lg leading-snug tracking-tight">
        {title}
      </span>
    </div>
  );
}
