import { cn } from "@workspace/ui/lib/utils";
import type { BuildPageTreeOptions } from "fumadocs-core/source";
import { Dancing_Script } from "next/font/google";

const dancing = Dancing_Script({ subsets: ["latin"] });

const Badge = ({
  name,
  className,
  children,
}: {
  name: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <span className="flex w-full items-center justify-between gap-3">
    <span className="font-normal!">{name}</span>{" "}
    <span
      className={cn(
        "text-nowrap font-black text-[17px] text-foreground leading-1",
        className
      )}
    >
      <span className={cn(dancing.className, "leading-1")}>{children}</span>
    </span>
  </span>
);

export const attachFile: BuildPageTreeOptions["attachFile"] = (node, file) => {
  if (!file) {
    return node;
  }
  const data = file.data;

  if ("alpha" in data && typeof data.alpha === "boolean" && data.alpha) {
    node.name = (
      <Badge
        className="bg-linear-to-br text-pink-600 dark:text-pink-400"
        name={node.name}
      >
        alpha
      </Badge>
    );
  }

  if ("beta" in data && typeof data.beta === "boolean" && data.beta) {
    node.name = (
      <Badge className="text-blue-600 dark:text-blue-400" name={node.name}>
        beta
      </Badge>
    );
  }

  if (
    "deprecated" in data &&
    typeof data.deprecated === "boolean" &&
    data.deprecated
  ) {
    node.name = (
      <Badge className="text-red-600 dark:text-red-400" name={node.name}>
        deprecated
      </Badge>
    );
  }

  if ("updated" in data && typeof data.updated === "boolean" && data.updated) {
    node.name = (
      <Badge
        className="text-emerald-600 dark:text-emerald-400"
        name={node.name}
      >
        updated
      </Badge>
    );
  }

  return node;
};
