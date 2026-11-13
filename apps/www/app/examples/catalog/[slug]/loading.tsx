import { Loader } from "lucide-react";

export default function CatalogExampleLoading() {
  return (
    <div className="text-muted-foreground flex h-screen w-full items-center justify-center text-sm">
      <Loader className="size-5 animate-spin" />
    </div>
  );
}
