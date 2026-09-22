import { Loader } from "lucide-react";

export default function UiLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center text-muted-foreground text-sm">
      <Loader className="size-5 animate-spin" />
    </div>
  );
}
