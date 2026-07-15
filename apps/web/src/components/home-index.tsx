import { AboutSection } from "@/components/home/about-section";
import { CvSidebar } from "@/components/home/cv-sidebar";
import { SiteHeader } from "@/components/home/site-header";
import { WorkSection } from "@/components/home/work-section";

export function HomeIndex() {
  return (
    <div className="bg-black text-white">
      <SiteHeader />
      <main className="no-scrollbar h-[calc(100svh-52px)] overflow-y-auto lg:grid lg:grid-cols-[360px_1fr_300px] lg:overflow-hidden">
        <AboutSection />
        <WorkSection />
        <CvSidebar />
      </main>
    </div>
  );
}
