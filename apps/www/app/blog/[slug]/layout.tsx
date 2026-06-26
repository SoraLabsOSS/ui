import type { ReactNode } from "react";

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-post-layout flex min-h-min w-full flex-1 flex-col items-start px-0 xl:flex-row">
      <div className="hidden w-[320px] 2xl:block" />
      {children}
    </div>
  );
}
