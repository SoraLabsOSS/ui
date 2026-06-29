"use client";

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

/** Deadlock Studios featured-work layout — copy into your page or customize. */
const studio = {
  root: "relative h-svh w-full overflow-hidden max-lg:h-dvh",
  images: "absolute inset-0 h-full w-full",
  imageFrame: "absolute inset-0 h-full w-full",
  image:
    "h-full w-full origin-center object-cover transition-transform duration-100 ease-out",
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

export default function ScrollGalleryDemo() {
  return (
    <ScrollGallery
      className={studio.root}
      imageClassName={studio.image}
      imageFrameClassName={studio.imageFrame}
      imagesClassName={studio.images}
      infoClassName={studio.info}
      infoInnerClassName={studio.infoInner}
      linkClassName={studio.link}
      linkLabel="Explore"
      linkTextClassName={studio.linkText}
      prefixClassName={studio.prefix}
      prefixLabel="Featured"
      prefixTextClassName={studio.prefixText}
      slides={DEMO_SLIDES}
      titleClassName={studio.title}
      titleTextClassName={studio.titleText}
    />
  );
}
