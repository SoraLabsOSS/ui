import { BioParagraphs } from "@/components/shared/bio-paragraphs";

export function AboutSection() {
  return (
    <div className="no-scrollbar animate-fade-in-up border-[#1a1a1a] border-b px-[26px] pt-7 pb-15 [animation-delay:50ms] lg:h-full lg:overflow-y-auto lg:border-r lg:border-b-0">
      <BioParagraphs />
    </div>
  );
}
