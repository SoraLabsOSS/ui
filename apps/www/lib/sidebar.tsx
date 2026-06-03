'use client';

import { Component } from 'lucide-react';
import { index } from '@/__registry__';

const TabsDescription = ({
  title,
  count,
}: {
  title: string;
  count: number;
}) => {
  return (
    <span className="flex flex-row items-center gap-2">
      <span>{title}</span>
      <span className="bg-foreground/10 text-foreground/50 rounded-full px-1.5 pt-0.5 pb-px text-[10px] font-semibold">
        {count}
      </span>
    </span>
  );
};

export const SIDEBAR_TABS = [
  {
    title: 'Components',
    description: (
      <TabsDescription
        title="Animated Components"
        count={
          Object.values(index).filter((item) =>
            item.name.startsWith('components-'),
          ).length
        }
      />
    ),
    icon: (
      <div className="text-muted-foreground size-full rounded-lg max-md:border max-md:bg-(--tab-color)/10 max-md:p-1.5 [&_svg]:size-full">
        <Component />
      </div>
    ),
    url: '/docs/texts/text-reveal',
  },
];
