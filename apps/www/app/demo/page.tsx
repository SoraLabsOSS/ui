import { CursorTrailDemoPage } from "./cursor-trail-demo";
import { ScrollDemoPage } from "./scroll-demo";
import { ScrollGalleryDemoPage } from "./scroll-gallery-demo";

export default function DemoPage() {
  return (
    <>
      <CursorTrailDemoPage />
      <ScrollGalleryDemoPage />
      <ScrollDemoPage />
    </>
  );
}
