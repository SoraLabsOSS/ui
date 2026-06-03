"use client";

import { ExternalLinkIcon } from "lucide-react";
import { motion } from "motion/react";

export const ExternalLink = ({
  href,
  text,
}: {
  href: string;
  text: string;
}) => (
  <motion.a
    className="not-prose flex w-fit flex-row items-center rounded-md bg-muted py-1 pr-2.5 pl-3 font-medium text-muted-foreground text-sm transition hover:bg-muted/70"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <span>{text}</span>
    <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
  </motion.a>
);
