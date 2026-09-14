import { Loader } from "lucide-react";

export default function CatalogExampleLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center text-muted-foreground text-sm">
      <Loader className="size-5 animate-spin" />
    </div>
  );
}
