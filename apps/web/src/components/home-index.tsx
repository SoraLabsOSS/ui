import { AboutSection } from "@/components/home/about-section";
import { CvSidebar } from "@/components/home/cv-sidebar";
import { SiteCursor } from "@/components/home/site-cursor";
import { SiteHeader } from "@/components/home/site-header";
import { WorkSection } from "@/components/home/work-section";

export function HomeIndex() {
  return (
    <div className="cursor-none bg-black text-white max-[1024px]:cursor-auto">
      <SiteCursor />
      <SiteHeader />
      <main className="no-scrollbar h-[calc(100svh-49px)] overflow-y-auto lg:grid lg:grid-cols-[360px_1fr_300px] lg:overflow-hidden">
        <AboutSection />
        <WorkSection />
        <CvSidebar />
      </main>
    </div>
  );
}
