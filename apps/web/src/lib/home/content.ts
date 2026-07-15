import { GITHUB_URL, TWITTER_URL } from "@/lib/site";

export interface NavItem {
  disabled?: boolean;
  href: string;
  label: string;
}

/** Blog and About aren't live yet — rendered dimmed and inert until they exist. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Work" },
  { disabled: true, href: "/blog", label: "Blog" },
  { disabled: true, href: "/about", label: "About" },
];

export interface Project {
  description: string;
  href: string;
  image: string;
  num: string;
  /** Rendered as separate lines, matching the original's <br /> breaks. */
  tagLines: string[];
  title: string;
}

export const PROJECTS: Project[] = [
  {
    description:
      "Sora UI — a component-driven interface project focused on clean, modern design and motion-ready UI building blocks.",
    href: "https://ui.soralabs.io.vn/",
    image: "/projects/sora-ui.png",
    num: "01",
    tagLines: ["Frontend, UI Design,", "Component System"],
    title: "Sora UI",
  },
  {
    description:
      "A browser-based font inspector — drag and drop OpenType or TrueType files to explore what's inside.",
    href: "https://type.soralabs.io.vn/",
    image: "/projects/sora-type.png",
    num: "02",
    tagLines: ["Frontend, Tooling,", "Typography"],
    title: "Sora Type",
  },
];

export interface CvEntry {
  href?: string;
  label: string;
  sub?: string;
}

export const WORK_EXPERIENCE: CvEntry[] = [
  {
    href: `${GITHUB_URL}?tab=repositories`,
    label: "Open Source",
    sub: "Personal Projects",
  },
  { label: "Web3 / Blockchain", sub: "Contracts & dApps" },
  { label: "Independent Developer", sub: "Since 2024" },
];

export const SKILLS = [
  "Fullstack Development",
  "Frontend Engineering",
  "Web3 & Smart Contracts",
  "API Design",
  "UI Animation",
  "Open Source",
];

export const TOOLS = [
  "TypeScript",
  "React & Next.js",
  "Node.js",
  "Tailwind CSS",
  "GSAP",
  "Solidity",
];

export const CONTACT_EMAIL = "truonggiang.axyl@gmail.com";

export interface SocialLink {
  href: string;
  label: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { href: GITHUB_URL, label: "GH" },
  { href: "https://linkedin.com/in/axyl1410", label: "Li" },
  { href: TWITTER_URL, label: "X" },
];
