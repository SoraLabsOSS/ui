import { cn } from "@workspace/ui/lib/utils";
import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function PlusSeparator({
  position,
  main = {},
  child,
}: {
  position: Corner[];
  main?: ComponentProps<typeof Plus>;
  child?: Partial<Record<Corner, ComponentProps<typeof Plus>>>;
}) {
  const { className, size, ...props } = main;

  const corners: Corner[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  const cornerClass: Record<Corner, string> = {
    "top-left": "-top-1 -left-[4.5px] absolute text-border",
    "top-right": "-top-1 -right-[4.5px] absolute text-border",
    "bottom-left": "-bottom-1 -left-[4.5px] absolute text-border",
    "bottom-right": "-bottom-1 -right-[4.5px] absolute text-border",
  };

  return (
    <>
      {corners
        .filter((corner) => position.includes(corner))
        .map((corner) => {
          const {
            className: childClassName,
            size: childSize,
            ...childProps
          } = child?.[corner] ?? {};

          return (
            <Plus
              className={cn(cornerClass[corner], className, childClassName)}
              key={corner}
              size={childSize ?? size ?? 8}
              {...props}
              {...childProps}
            />
          );
        })}
    </>
  );
}
