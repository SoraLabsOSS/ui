import { cn } from "@workspace/ui/lib/utils";
import { MessageCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";
import { buttonVariants } from "@/components/ui/button";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import { ComponentsRouteLayout } from "./components-route-layout";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navItems = getComponentGalleryItems();
  const primitivesUrl = getFirstPrimitiveDocUrl();

  return (
    <ComponentsRouteLayout navItems={navItems} primitivesUrl={primitivesUrl}>
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger
          className={cn(
            buttonVariants({
              variant: "secondary",
              className: "rounded-2xl text-fd-muted-foreground",
            })
          )}
          position="float"
        >
          <MessageCircleIcon className="size-4.5" />
          Ask AI
        </AISearchTrigger>
      </AISearch>
      {children}
    </ComponentsRouteLayout>
  );
}
