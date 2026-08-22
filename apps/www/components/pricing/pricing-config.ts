import { CONTACT_EMAIL } from "@/lib/site";

export const GITHUB_SPONSORS_URL =
  "https://github.com/sponsors/axyl1410" as const;

export const PRICING_CORE_MESSAGE =
  "Sora UI is free forever. No Pro plan, no locked components, no paywall.";

export const PRICING_DISCLAIMER =
  "Component requests are considered based on fit, quality, and maintainability. Donations help prioritize requested work, but Sora UI remains free for everyone.";

export const PRICING_HERO = {
  eyebrow: "Pricing",
  title: "Free forever. Supported by the community.",
  description:
    "Sora UI is an open component registry for React and shadcn/ui. Every component is free to use, copy, and customize.",
} as const;

export const PRICING_FREE_FEATURES = [
  "All primitives",
  "All components",
  "Full source code",
  "Install commands",
  "Component docs",
  "Updates",
  "No usage limits",
  "No paywall",
] as const;

export const PRICING_SUPPORT_FEATURES = [
  "Suggest improvements",
  "Help prioritize future work",
  "Keep the registry maintained",
] as const;

export interface PricingFaqItem {
  content: string;
  title: string;
}

export const PRICING_FAQ_ITEMS: PricingFaqItem[] = [
  {
    title: "Is Sora UI really free?",
    content:
      "Yes. Every primitive in the docs is free to preview and install. Copy the source into your project, customize it, and ship—no account required.",
  },
  {
    title: "Will there be a Pro plan?",
    content:
      "Not today. Sora UI is free forever with no locked components. If that ever changes, it will be communicated clearly—not through a surprise paywall.",
  },
  {
    title: "What does supporting the project do?",
    content:
      "Optional GitHub Sponsors support helps keep Sora UI maintained and free for everyone. Supporters can suggest and help prioritize new components—it is support, not a purchase.",
  },
  {
    title: "Can I use components commercially?",
    content:
      "Yes. Use components in personal, commercial, and client projects. See the License page for full terms, including the Commons Clause restriction on reselling components as-is.",
  },
  {
    title: "How do I install?",
    content:
      "Initialize shadcn/ui, register the @soralabs namespace, then run npx shadcn@latest add @soralabs/<component-name>. Full steps are in the Installation guide.",
  },
];

export function getSupportEmail(): string {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return email && email.length > 0 ? email : CONTACT_EMAIL;
}

export function getSupportMailtoUrl(): string {
  const email = getSupportEmail();
  return `mailto:${email}?subject=${encodeURIComponent("Sora UI component request")}`;
}
