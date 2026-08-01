import { cn } from "@workspace/ui/lib/utils";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes, ReactNode, Ref } from "react";

type CalloutProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "type" | "icon"
> & {
  title?: ReactNode;
  type?: "info" | "warn" | "error" | "success" | "warning";
  icon?: ReactNode;
};

const iconClass = "size-5 -me-0.5 fill-(--callout-color) text-fd-accent";

export const Callout = ({
  className,
  children,
  title,
  type = "info",
  icon,
  ref,
  ...props
}: CalloutProps & { ref?: Ref<HTMLDivElement> }) => {
  if (type === "warn") {
    type = "warning";
  }
  if ((type as unknown) === "tip") {
    type = "info";
  }

  return (
    <div
      className={cn(
        "my-4 flex gap-2 rounded-lg bg-fd-accent/50 p-3 ps-2 text-fd-card-foreground text-sm",
        className
      )}
      ref={ref}
      {...props}
      style={
        {
          "--callout-color": `var(--color-fd-${type}, var(--color-fd-muted))`,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <div className="w-0.5 rounded-sm bg-(--callout-color)/50" role="none" />
      {icon ??
        {
          info: <Info className={iconClass} />,
          warning: <TriangleAlert className={iconClass} />,
          error: <CircleX className={iconClass} />,
          success: <CircleCheck className={iconClass} />,
        }[type]}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {title && <p className="!my-0 font-medium">{title}</p>}
        <div className="prose-no-margin text-fd-muted-foreground empty:hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

Callout.displayName = "Callout";
