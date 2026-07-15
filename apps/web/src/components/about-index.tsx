import { AboutCvList } from "@/components/about/about-cv-list";
import { PageHeader } from "@/components/page-header";
import { BioParagraphs } from "@/components/shared/bio-paragraphs";
import { WorkFooter } from "@/components/work/work-footer";

export function AboutIndex() {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="About" />
      <main className="mx-auto w-full max-w-[560px] flex-1 px-[28px] pt-[60px] pb-[48px] lg:pb-[90px]">
        <div className="animate-fade-in-up [animation-delay:50ms]">
          <BioParagraphs textClassName="text-[13px]" />
        </div>
        <div className="mt-5 animate-fade-in-up border-[#1a1a1a] border-t pt-5 [animation-delay:100ms]">
          <AboutCvList />
        </div>
      </main>
      <WorkFooter fixedOnDesktop />
    </div>
  );
}
