import type { ReactNode } from "react";
import { EmailCopy } from "@/components/home/email-copy";
import {
  CONTACT_EMAIL,
  SKILLS,
  SOCIAL_LINKS,
  TOOLS,
  WORK_EXPERIENCE,
} from "@/lib/home/content";

function CvBlock({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="border-[#1a1a1a] border-b py-5.5">
      <p className="mb-3.5 text-[#555] text-[9px] uppercase tracking-[0.15em]">
        {label}
      </p>
      {children}
    </div>
  );
}

export function CvSidebar() {
  return (
    <div className="no-scrollbar flex min-h-full animate-fade-in-up flex-col border-[#1a1a1a] px-[26px] pb-15 [animation-delay:150ms] lg:h-full lg:overflow-y-auto lg:border-l">
      <CvBlock label="Work Experience">
        <div className="flex flex-col gap-3 text-[11px] leading-[1.8]">
          {WORK_EXPERIENCE.map((entry) => (
            <div key={entry.label}>
              {entry.href ? (
                <a
                  className="block w-fit text-white no-underline"
                  href={entry.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {entry.label}
                </a>
              ) : (
                <span className="block w-fit">{entry.label}</span>
              )}
              {entry.sub ? (
                <span className="block text-[#555] text-[10px]">
                  {entry.sub}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </CvBlock>

      <CvBlock label="Skills">
        <div className="flex flex-col gap-1 text-[11px] leading-[1.8]">
          {SKILLS.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </CvBlock>

      <CvBlock label="Tools">
        <div className="flex flex-col gap-1 text-[11px] leading-[1.8]">
          {TOOLS.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
      </CvBlock>

      <div className="mt-auto py-5.5">
        <EmailCopy email={CONTACT_EMAIL} />
        <div className="mt-3.5 flex gap-2.5">
          {SOCIAL_LINKS.map((social) => (
            <a
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#333] text-[#999] text-[10px] uppercase tracking-[0.04em] no-underline transition-colors hover:border-[#555] hover:text-white"
              data-cursor-hover
              href={social.href}
              key={social.label}
              rel="noopener noreferrer"
              target="_blank"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
