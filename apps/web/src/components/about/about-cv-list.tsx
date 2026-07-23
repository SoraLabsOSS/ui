import type { ReactNode } from "react";
import { EmailCopy } from "@/components/home/email-copy";
import { SocialIcon } from "@/components/shared/social-icon";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/home/content";

function CvRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 border-[#1a1a1a] border-t py-[22px] first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[160px_1fr] sm:gap-6">
      <div className="pt-0.5 text-[#555] text-[10px] uppercase tracking-[0.15em]">
        {label}
      </div>
      <div className="text-[13px] text-white leading-[1.85]">{children}</div>
    </div>
  );
}

export function AboutCvList() {
  return (
    <div className="flex flex-col">
      <CvRow label="Contact">
        <EmailCopy email={CONTACT_EMAIL} />
        <div className="mt-4.5 flex gap-2.5">
          {SOCIAL_LINKS.map((social) => (
            <a
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#333] text-[#999] text-[10px] uppercase tracking-[0.04em] no-underline transition-colors hover:border-[#555] hover:text-white"
              data-cursor-hover
              href={social.href}
              key={social.label}
              rel="noopener noreferrer"
              target="_blank"
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
        </div>
      </CvRow>
    </div>
  );
}
