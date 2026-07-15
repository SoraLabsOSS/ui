import type { Metadata } from "next";
import { AboutIndex } from "@/components/about-index";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return <AboutIndex />;
}
