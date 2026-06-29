import { GITHUB_PROFILE_URL, X_PROFILE_URL } from "@/lib/site";
import { FooterArrowLink } from "./footer-arrow-link";

const SOCIAL_LINKS = [
  {
    href: X_PROFILE_URL,
    label: "X",
    icon: (
      <path d="M215,219.85a8,8,0,0,1-7,4.15H160a8,8,0,0,1-6.75-3.71l-40.49-63.63L53.92,221.38a8,8,0,0,1-11.84-10.76l61.77-68L41.25,44.3A8,8,0,0,1,48,32H96a8,8,0,0,1,6.75,3.71l40.49,63.63,58.84-64.72a8,8,0,0,1,11.84,10.76l-61.77,67.95,62.6,98.38A8,8,0,0,1,215,219.85Z" />
    ),
  },
  {
    href: GITHUB_PROFILE_URL,
    label: "GitHub",
    icon: (
      <path d="M216,104v8a56.06,56.06,0,0,1-48.44,55.47A39.8,39.8,0,0,1,176,192v40a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V216H72a40,40,0,0,1-40-40A24,24,0,0,0,8,152a8,8,0,0,1,0-16,40,40,0,0,1,40,40,24,24,0,0,0,24,24H96v-8a39.8,39.8,0,0,1,8.44-24.53A56.06,56.06,0,0,1,56,112v-8a58.14,58.14,0,0,1,7.69-28.32A59.78,59.78,0,0,1,69.07,28,8,8,0,0,1,76,24a59.75,59.75,0,0,1,48,24h24a59.75,59.75,0,0,1,48-24,8,8,0,0,1,6.93,4,59.74,59.74,0,0,1,5.37,47.68A58,58,0,0,1,216,104Z" />
    ),
  },
] as const;

export function FooterSocial() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
      {SOCIAL_LINKS.map((link) => (
        <a
          className="flex size-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:text-muted-foreground"
          href={link.href}
          key={link.label}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="sr-only">{link.label}</span>
          <svg
            aria-hidden="true"
            className="size-5"
            fill="currentColor"
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
          >
            {link.icon}
          </svg>
        </a>
      ))}

      <FooterArrowLink
        className="font-mono text-xs uppercase tracking-widest"
        href="/docs"
        textClassName="normal-case tracking-normal"
      >
        Docs
      </FooterArrowLink>
    </div>
  );
}
