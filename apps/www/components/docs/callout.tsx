import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@workspace/ui/lib/utils';

type CalloutProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'type' | 'icon'
> & {
  title?: ReactNode;
  type?: 'info' | 'warn' | 'error' | 'success' | 'warning';
  icon?: ReactNode;
};

const iconClass = 'size-5 -me-0.5 fill-(--callout-color) text-fd-accent';

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, children, title, type = 'info', icon, ...props }, ref) => {
    if (type === 'warn') type = 'warning';
    if ((type as unknown) === 'tip') type = 'info';

    return (
      <div
        ref={ref}
        className={cn(
          'bg-fd-accent/50 text-fd-card-foreground my-4 flex gap-2 rounded-lg p-3 ps-2 text-sm',
          className,
        )}
        {...props}
        style={
          {
            '--callout-color': `var(--color-fd-${type}, var(--color-fd-muted))`,
            ...props.style,
          } as object
        }
      >
        <div role="none" className="w-0.5 rounded-sm bg-(--callout-color)/50" />
        {icon ??
          {
            info: <Info className={iconClass} />,
            warning: <TriangleAlert className={iconClass} />,
            error: <CircleX className={iconClass} />,
            success: <CircleCheck className={iconClass} />,
          }[type]}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {title && <p className="!my-0 font-medium">{title}</p>}
          <div className="text-fd-muted-foreground prose-no-margin empty:hidden">
            {children}
          </div>
        </div>
      </div>
    );
  },
);

Callout.displayName = 'Callout';
