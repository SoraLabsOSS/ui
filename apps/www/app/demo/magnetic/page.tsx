import type { Metadata } from "next";
import { MagneticDemoPage } from "../magnetic-demo";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Magnetic Cards Demo | Sora UI",
};

export default function MagneticDemoRoute() {
  return <MagneticDemoPage />;
}
