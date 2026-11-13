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

function resolveCalloutType(
  type: CalloutProps["type"]
): "info" | "warning" | "error" | "success" {
  if (type === "warn") {
    return "warning";
  }
  if (type === "error" || type === "success" || type === "warning") {
    return type;
  }
  return "info";
}

export const Callout = ({
  className,
  children,
  title,
  type: rawType,
  icon,
  ref,
  ...props
}: CalloutProps & { ref?: Ref<HTMLDivElement> }) => {
  const type = resolveCalloutType(rawType);

  return (
    <div
      className={cn(
        "bg-fd-accent/50 text-fd-card-foreground my-4 flex gap-2 rounded-lg p-3 ps-2 text-sm",
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
