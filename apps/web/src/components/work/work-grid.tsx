import Image from "next/image";
import { PROJECTS } from "@/lib/home/content";

export function WorkGrid() {
  return (
    <div className="grid animate-fade-in-up grid-cols-1 gap-x-3.5 gap-y-12 p-3.5 [animation-delay:100ms] [animation-duration:0.4s] max-sm:gap-y-0 max-sm:p-0 sm:grid-cols-3">
      {PROJECTS.map((project, index) => (
        <div
          className="block max-sm:border-[#1a1a1a] max-sm:border-b max-sm:last:border-none"
          key={project.title}
        >
          <a
            className="block"
            data-cursor-hover
            href={project.liveUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[#080808]">
              <Image
                alt={project.title}
                className="object-cover"
                fill
                priority={index === 0}
                sizes="(min-width: 640px) 33vw, 100vw"
                src={project.image}
              />
            </div>
          </a>
          <div className="flex items-center justify-between gap-3 pt-2.5 pb-1 max-sm:px-4 max-sm:py-3.5">
            <a
              className="text-[11px] text-white uppercase tracking-[0.06em] no-underline"
              data-cursor-hover
              href={project.liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {String(index + 1).padStart(2, "0")}/ {project.title}
            </a>
            <a
              className="hidden whitespace-nowrap text-[#999] text-[10px] uppercase tracking-[0.04em] no-underline transition-opacity hover:opacity-40 max-sm:block"
              data-cursor-hover
              href={project.liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open project →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
