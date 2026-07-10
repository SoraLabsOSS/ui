"use client";

import {
  InlineTestimonials,
  type Testimonial,
} from "@/registry/primitives/disclosure/inline-testimonials";

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    text: "Finally a registry that treats animation as a first-class citizen.",
    author: {
      name: "Jordan Lee",
      role: "Staff Engineer @Vercel",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=faces",
    },
  },
  {
    id: "2",
    text: "Shipped our marketing site in a weekend — the motion primitives just work.",
    author: {
      name: "Maya Chen",
      role: "Founder @Orbit",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
    },
  },
  {
    id: "3",
    text: "Copy-paste, tweak tokens, ship. No black-box npm package in the way.",
    author: {
      name: "Sofia Alvarez",
      role: "Product Designer @Linear",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces",
    },
  },
  {
    id: "4",
    text: "Looks editorial, feels interactive — exactly what our landing needed.",
    author: {
      name: "Elena Rossi",
      role: "Brand Lead @Figma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces",
    },
  },
];

export default function InlineTestimonialsExample() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <InlineTestimonials testimonials={TESTIMONIALS} />
    </div>
  );
}
