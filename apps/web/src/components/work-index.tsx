import { PageHeader } from "@/components/page-header";
import { WorkFooter } from "@/components/work/work-footer";
import { WorkGrid } from "@/components/work/work-grid";

export function WorkIndex() {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <PageHeader crumb="Work" />
      <WorkGrid />
      <WorkFooter />
    </div>
  );
}
