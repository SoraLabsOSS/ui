import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/ui/breadcrumb";

interface ComponentPageDocsBreadcrumbProps {
  className?: string;
  title: string;
}

export function ComponentPageDocsBreadcrumb({
  className,
  title,
}: ComponentPageDocsBreadcrumbProps) {
  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 text-sm sm:gap-2.5">
          <BreadcrumbItem>
            <BreadcrumbLink href="/components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
