"use client";

import { Folder } from "dialkit";
import type { ComponentProps } from "react";

export type ControlFolderProps = ComponentProps<typeof Folder> & {
  className?: string;
};

export const ControlFolder = ({ className, ...props }: ControlFolderProps) => {
  if (className) {
    return (
      <div className={className}>
        <Folder {...props} />
      </div>
    );
  }
  return <Folder {...props} />;
};
