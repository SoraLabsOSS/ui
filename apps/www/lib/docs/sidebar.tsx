"use client";

import { Component } from "lucide-react";
import { index } from "@/__registry__";

const TabsDescription = ({
  title,
  count,
}: {
  title: string;
  count: number;
}) => (
  <span className="flex flex-row items-center gap-2">
    <span>{title}</span>
    <span className="rounded-full bg-foreground/10 px-1.5 pt-0.5 pb-px font-semibold text-[10px] text-foreground/50">
      {count}
    </span>
  </span>
);

export const SIDEBAR_TABS = [
  {
    title: "Components",
    description: (
      <TabsDescription
        count={
          Object.values(index).filter((item) =>
            item.name.startsWith("components-")
          ).length
        }
        title="Animated Components"
      />
    ),
    icon: (
      <div className="size-full rounded-lg text-muted-foreground max-md:border max-md:bg-(--tab-color)/10 max-md:p-1.5 [&_svg]:size-full">
        <Component />
      </div>
    ),
    url: "/docs/primitives/text-reveal",
  },
];
