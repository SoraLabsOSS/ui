'use client';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { cn } from '@workspace/ui/lib/utils';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

type ChangelogItemContextType = {
  major: boolean;
};

const [ChangelogItemProvider, useChangelogItem] =
  getStrictContext<ChangelogItemContextType>('ChangelogItemContext');

type ChangelogProps = React.ComponentProps<'div'>;

export function Changelog(props: ChangelogProps) {
  return <div className="mt-4 flex flex-col" {...props} />;
}

type ChangelogItemProps = React.ComponentProps<'div'> & {
  date: string;
  major: boolean;
};

export const ChangelogItem = ({
  major = false,
  children,
  date,
  ...props
}: ChangelogItemProps) => {
  return (
    <ChangelogItemProvider value={{ major }}>
      <div className="flex flex-col gap-x-6 sm:flex-row" {...props}>
        <div className="relative h-auto w-28 shrink-0 max-sm:mb-2">
          <p className="top-20 left-0 mt-0 text-sm text-neutral-500 sm:sticky">
            {format(new Date(date), 'MMM d, yyyy', { locale: enUS })}
          </p>
        </div>
        <div className="relative hidden h-auto w-2.5 shrink-0 flex-col items-center pt-[5px] sm:flex">
          <div
            className={cn(
              'relative size-2.5 shrink-0 rounded-full',
              major ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700',
            )}
          >
            {major && (
              <div className="border-primary absolute top-1/2 left-1/2 size-4.5 shrink-0 -translate-x-1/2 -translate-y-1/2 rounded-full border" />
            )}
          </div>
          <div
            className={cn(
              'absolute top-[18px] -bottom-[2px] left-1/2 w-px -translate-x-1/2 rounded-full',
              major ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700',
            )}
          />
        </div>
        <div className="h-auto flex-1 pb-24">{children}</div>
      </div>
    </ChangelogItemProvider>
  );
};

type ChangelogItemVersionProps = React.ComponentProps<'div'>;

export const ChangelogItemVersion = ({
  children,
  ...props
}: ChangelogItemVersionProps) => {
  const { major } = useChangelogItem();

  return (
    <div
      className={cn(
        '[&_a]:text-foreground [&_a]:bg-accent -mt-[3px] [&_a]:rounded-md [&_a]:border [&_a]:px-1.5 [&_a]:py-0.5 [&_a]:text-sm [&_a]:font-normal [&>h2]:mt-0 [&>h2]:mb-6 [&>h2]:w-fit',
        major &&
          '[&_a]:bg-primary [&_a]:text-primary-foreground [&_a]:border-neutral-600 dark:[&_a]:border-neutral-300',
      )}
      {...props}
    >
      {children}
    </div>
  );
};

type ChangelogItemTitleProps = React.ComponentProps<'h3'>;

export const ChangelogItemTitle = ({
  children,
  ...props
}: ChangelogItemTitleProps) => {
  return (
    <h3 className="mt-0 mb-2.5 text-lg font-semibold" {...props}>
      {children}
    </h3>
  );
};

type ChangelogItemDescriptionProps = React.ComponentProps<'div'>;

export const ChangelogItemDescription = ({
  children,
  ...props
}: ChangelogItemDescriptionProps) => {
  return (
    <div className="text-muted-foreground mt-0 text-sm" {...props}>
      {children}
    </div>
  );
};
