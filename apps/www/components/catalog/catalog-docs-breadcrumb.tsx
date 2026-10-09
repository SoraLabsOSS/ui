import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/ui/breadcrumb";
import Link from "next/link";

interface ComponentPageDocsBreadcrumbProps {
  className?: string;
  title?: string;
}

export function ComponentPageDocsBreadcrumb({
  className,
  title,
}: ComponentPageDocsBreadcrumbProps) {
  return (
    <div className={className}>
      <Breadcrumb className="flex h-full items-center">
        <BreadcrumbList className="flex h-full flex-nowrap items-center gap-1.5 font-normal text-[15px] text-zinc-500 leading-none tracking-[-0.01em] dark:text-zinc-400">
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="text-inherit hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <Link href="/catalog">Catalog</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="opacity-50" />
          <BreadcrumbItem>
            {title ? (
              <BreadcrumbPage className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                {title}
              </BreadcrumbPage>
            ) : (
              <div className="h-4 w-28 rounded-md bg-accent motion-safe:animate-pulse" />
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
