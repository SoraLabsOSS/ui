"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import { ScrollGallery } from "@/registry/primitives/effects/scroll-gallery";

const DEMO_SLIDES = [
  {
    title: "Room 14B",
    image: "/featured-work/featured-work-1.jpg",
    url: "#",
  },
  {
    title: "Subject Identified",
    image: "/featured-work/featured-work-2.jpg",
    url: "#",
  },
  {
    title: "Dossier 09",
    image: "/featured-work/featured-work-3.jpg",
    url: "#",
  },
  {
    title: "Stairwell C7",
    image: "/featured-work/featured-work-4.jpg",
    url: "#",
  },
];

/** Catalog / docs preview preset — not shipped with the registry primitive. */
export const SCROLL_GALLERY_STUDIO_CLASSES = {
  root: "relative h-svh w-full overflow-hidden max-lg:h-dvh @/preview:h-[100cqh]",
  images: "absolute inset-0 h-full w-full",
  imageFrame: "absolute inset-0 h-full w-full",
  image: "h-full w-full origin-center object-cover",
  info: "absolute top-1/2 left-0 z-[2] w-screen -translate-y-1/2 border-white/20 border-b",
  infoInner: "flex gap-8 px-9",
  prefix: "flex-1 max-[1000px]:hidden",
  prefixText:
    "font-medium text-[36px] text-white leading-none tracking-[-0.02rem] antialiased will-change-transform max-[1000px]:text-[18px]",
  title: "relative h-10 flex-[2] overflow-hidden max-[1000px]:h-[22px]",
  titleText:
    "font-medium text-[36px] text-white leading-none tracking-[-0.02rem] antialiased will-change-transform [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)] max-[1000px]:text-[18px]",
  link: "flex flex-1 justify-end",
  linkText:
    "font-medium text-[36px] text-white leading-none tracking-[-0.02rem] no-underline antialiased will-change-transform max-[1000px]:text-[18px]",
} as const;

export default function ScrollGalleryCatalogPreview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<Element | Window | undefined>();

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const resolved = resolveScrollRoot(node);

    waitForScrollerReady(resolved)
      .then(() => {
        setScroller(resolved);
      })
      .catch(() => {
        /* preview unmounted */
      });
  }, []);

  return (
    <div className="w-full" ref={rootRef}>
      <CatalogScrollHint label="Scroll inside the preview to scrub slides" />
      {scroller ? (
        <ScrollGallery
          embedded
          imageClassName={SCROLL_GALLERY_STUDIO_CLASSES.image}
          imageFrameClassName={SCROLL_GALLERY_STUDIO_CLASSES.imageFrame}
          imagesClassName={SCROLL_GALLERY_STUDIO_CLASSES.images}
          infoClassName={SCROLL_GALLERY_STUDIO_CLASSES.info}
          infoInnerClassName={SCROLL_GALLERY_STUDIO_CLASSES.infoInner}
          linkClassName={SCROLL_GALLERY_STUDIO_CLASSES.link}
          linkLabel="Explore"
          linkTextClassName={SCROLL_GALLERY_STUDIO_CLASSES.linkText}
          prefixClassName={SCROLL_GALLERY_STUDIO_CLASSES.prefix}
          prefixLabel="Featured"
          prefixTextClassName={SCROLL_GALLERY_STUDIO_CLASSES.prefixText}
          scroller={scroller}
          slides={DEMO_SLIDES}
          titleClassName={SCROLL_GALLERY_STUDIO_CLASSES.title}
          titleTextClassName={SCROLL_GALLERY_STUDIO_CLASSES.titleText}
        />
      ) : null}
    </div>
  );
}
