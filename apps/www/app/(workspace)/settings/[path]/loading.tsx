import { Loader } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="flex text-muted-foreground text-sm">
      <div className="flex min-h-full w-full items-center justify-center">
        <Loader className="mr-2 size-4 animate-spin" />
      </div>
    </div>
  );
}
