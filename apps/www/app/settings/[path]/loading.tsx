import { Spinner } from "@workspace/ui/components/ui/spinner";

export default function SettingsLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}
