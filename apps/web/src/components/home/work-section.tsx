import Image from "next/image";
import { CONTACT_EMAIL, PROJECTS } from "@/lib/home/content";

export function WorkSection() {
  return (
    <div className="no-scrollbar flex animate-fade-in-up flex-col [animation-delay:100ms] lg:h-full lg:overflow-y-auto">
      <div className="flex-1">
        {PROJECTS.map((project, index) =>
          project.comingSoon ? (
            <div className="border-[#1a1a1a] border-b" key={project.num}>
              <div className="group relative block aspect-video w-full overflow-hidden bg-[#080808]">
                <Image
                  alt={project.title}
                  className="object-cover opacity-60 grayscale"
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  src={project.image}
                />
                <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-[10px] text-white uppercase tracking-[0.24em]">
                  Coming Soon
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 px-[26px] pt-3.5 pb-7">
                <div>
                  <p className="mb-1.5 text-[11px]">
                    ({project.num}){" "}
                    <span className="text-white">{project.title}</span>
                  </p>
                  <p className="text-[#555] text-[11px] leading-[1.6]">
                    {project.tagLines.map((line, i) => (
                      <span key={line}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="self-end">
                  <p className="mb-2.5 block w-fit text-[#555] text-[11px] uppercase tracking-[0.06em]">
                    Coming soon.
                  </p>
                  <p className="text-[#555] text-[11px] leading-[1.7]">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-[#1a1a1a] border-b" key={project.num}>
              <a
                className="group relative block aspect-video w-full overflow-hidden bg-[#080808] no-underline"
                data-cursor-hover
                href={project.liveUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image
                  alt={project.title}
                  className="object-cover transition-[filter] duration-300 group-hover:brightness-[0.35]"
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  src={project.image}
                />
                <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-[10px] text-white uppercase tracking-[0.24em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  View Project →
                </span>
              </a>
              <div className="grid grid-cols-2 gap-4 px-[26px] pt-3.5 pb-7">
                <div>
                  <p className="mb-1.5 text-[11px]">
                    ({project.num}){" "}
                    <a
                      className="relative text-white no-underline"
                      data-cursor-hover
                      href={project.liveUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {project.title}
                    </a>
                  </p>
                  <p className="text-[#555] text-[11px] leading-[1.6]">
                    {project.tagLines.map((line, i) => (
                      <span key={line}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="self-end">
                  <a
                    className="mb-2.5 block w-fit text-[11px] text-white no-underline"
                    data-cursor-hover
                    href={project.liveUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Full case study.
                  </a>
                  <p className="text-[#555] text-[11px] leading-[1.7]">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 border-[#1a1a1a] border-t px-6 py-15 text-center lg:min-h-svh">
        <span className="font-normal text-[clamp(64px,10vw,140px)] text-white leading-[0.95] tracking-[-0.04em] md:text-[clamp(56px,7vw,100px)] xl:text-[clamp(64px,10vw,140px)]">
          Let&apos;s work
          <br />
          together.
        </span>
        <span className="text-[#555] text-xs uppercase tracking-[0.12em]">
          {CONTACT_EMAIL}
        </span>
      </div>
    </div>
  );
}
