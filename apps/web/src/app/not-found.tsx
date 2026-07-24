import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WorkFooter } from "@/components/work/work-footer";
import { NAV_ITEMS } from "@/lib/home/content";

const LINKS = [{ href: "/", label: "Home" }, ...NAV_ITEMS];

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="404" />
      <main className="mx-auto w-full max-w-[560px] flex-1 px-[28px] pt-[60px] pb-[48px] lg:pb-[90px]">
        <div className="animate-fade-in-up [animation-delay:50ms]">
          <span className="text-[#555] text-[10px] uppercase tracking-[0.12em]">
            404
          </span>
          <h1 className="mt-3 font-normal text-[clamp(48px,10vw,88px)] leading-[0.95] tracking-[-0.04em]">
            Page not found.
          </h1>
          <p className="mt-4 max-w-[420px] text-[#999] text-[13px] leading-[1.7]">
            This route doesn&apos;t exist — it may have moved, or never existed
            at all.
          </p>
        </div>

        <div className="mt-8 animate-fade-in-up border-[#1a1a1a] border-t pt-5 [animation-delay:100ms]">
          <span className="text-[#555] text-[10px] uppercase tracking-[0.12em]">
            Try one of these
          </span>
          <div className="mt-3 flex flex-col">
            {LINKS.map((item) => (
              <Link
                className="group flex items-center justify-between border-[#1a1a1a] border-b py-3 text-[13px] text-white no-underline last:border-b-0"
                data-cursor-hover
                href={item.href}
                key={item.href}
              >
                {item.label}
                <span className="text-[#555] transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <WorkFooter fixedOnDesktop />
    </div>
  );
}
