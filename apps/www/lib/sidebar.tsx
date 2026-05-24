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
    <span className="flex items-center flex-row gap-2">
      <span>{title}</span>
      <span className="pt-0.5 pb-px px-1.5 font-semibold rounded-full bg-foreground/10 text-[10px] text-foreground/50">
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
      <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
        <Component />
      </div>
    ),
    url: '/docs/components',
  },
];
