"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva } from "class-variance-authority";
import Link from "fumadocs-core/link";
import { Info } from "fumadocs-ui/components/type-table";
import { Info as InfoIcon } from "lucide-react";
import type { ReactNode } from "react";

const fieldClassName = "inline-flex flex-row items-center gap-1";

const codeChip = cva(
  "bg-muted/50 text-foreground rounded-md px-1 py-0.5 font-mono text-xs",
  {
    variants: {
      color: {
        primary: "bg-muted/50 text-foreground",
        deprecated: "bg-muted/50 text-foreground/50 line-through",
      },
    },
  }
);

interface ObjectType {
  default?: string;
  deprecated?: boolean;
  description?: ReactNode;
  required?: boolean;
  type: string;
  typeDescription?: ReactNode;
  typeDescriptionLink?: string;
}

interface SoraTypeTableProps {
  className?: string;
  type: Record<string, ObjectType>;
}

export function SoraTypeTable({ type, className }: SoraTypeTableProps) {
  return (
    <div
      className={cn(
        "sora-type-table not-prose border-border my-4 w-full max-w-full min-w-0 overflow-x-auto rounded-xl border",
        className
      )}
    >
      <table className="text-muted-foreground w-full border-collapse text-sm">
        <thead>
          <tr className="border-border bg-muted/30 border-b">
            <th className="text-foreground w-[45%] px-3 py-2.5 text-left font-medium">
              Prop
            </th>
            <th className="text-foreground w-[30%] px-3 py-2.5 text-left font-medium">
              Type
            </th>
            <th className="text-foreground w-1/4 px-3 py-2.5 text-left font-medium">
              Default
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(type).map(([key, value]) => (
            <tr className="border-border border-b last:border-b-0" key={key}>
              <td className="px-3 py-2.5 align-top">
                <div className={fieldClassName}>
                  <code
                    className={cn(
                      codeChip({
                        color: value.deprecated ? "deprecated" : "primary",
                      })
                    )}
                  >
                    {key}
                    {value.required ? null : "?"}
                  </code>
                  {value.description ? <Info>{value.description}</Info> : null}
                </div>
              </td>
              <td className="px-3 py-2.5 align-top">
                <div className={fieldClassName}>
                  <code className={codeChip()}>{value.type}</code>
                  {value.typeDescription ? (
                    <Info>{value.typeDescription}</Info>
                  ) : null}
                  {value.typeDescriptionLink ? (
                    <Link href={value.typeDescriptionLink}>
                      <InfoIcon className="size-4" />
                    </Link>
                  ) : null}
                </div>
              </td>
              <td className="px-3 py-2.5 align-top">
                {value.default ? (
                  <code className={codeChip()}>{value.default}</code>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
