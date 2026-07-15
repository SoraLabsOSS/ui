import type { Metadata } from "next";
import { WorkIndex } from "@/components/work-index";

export const metadata: Metadata = {
  title: "Selected Work",
};

export default function WorkPage() {
  return <WorkIndex />;
}
