import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { highlight } from "sugar-high";

function Anchor({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href?.startsWith("/")) {
    return <Link href={href} {...props} />;
  }

  return <a href={href} rel="noopener noreferrer" target="_blank" {...props} />;
}

function Code({ children, ...props }: HTMLAttributes<HTMLElement>) {
  if (typeof children !== "string") {
    return <code {...props}>{children}</code>;
  }

  const html = highlight(children);
  // biome-ignore lint/security/noDangerouslySetInnerHtml: sugar-high output is escaped HTML for our own MDX content, not user input.
  return <code dangerouslySetInnerHTML={{ __html: html }} {...props} />;
}

function MdxImage({ alt, src }: { alt: string; src: ImageProps["src"] }) {
  return (
    <span className="relative block aspect-video overflow-hidden rounded-lg border border-[#1a1a1a]">
      <Image alt={alt} className="object-cover" fill src={src} />
    </span>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: Anchor,
    code: Code,
    img: MdxImage,
    ...components,
  };
}
