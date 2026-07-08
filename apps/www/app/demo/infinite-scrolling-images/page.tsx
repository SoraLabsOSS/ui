import type { Metadata } from "next";
import { InfiniteScrollingImagesDemoPage } from "../infinite-scrolling-images-demo";

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Infinite Scrolling Images Demo | Sora UI",
};

export default function InfiniteScrollingImagesDemoRoute() {
  return <InfiniteScrollingImagesDemoPage />;
}
