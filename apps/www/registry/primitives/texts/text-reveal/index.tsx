"use client";

import type * as React from "react";

type TextRevealProps = React.ComponentProps<"span">;

function TextReveal({ children, ...props }: TextRevealProps) {
  return <span {...props}>hello world {children}</span>;
}

export { TextReveal, type TextRevealProps };
