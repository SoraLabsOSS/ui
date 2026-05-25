'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const ExternalLink = ({
  href,
  text,
}: {
  href: string;
  text: string;
}) => {
  return (
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose bg-muted hover:bg-muted/70 text-muted-foreground flex w-fit flex-row items-center rounded-md py-1 pr-2.5 pl-3 text-sm font-medium transition"
    >
      <span>{text}</span>
      <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
    </motion.a>
  );
};
