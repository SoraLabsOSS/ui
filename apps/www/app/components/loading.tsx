import { Spinner } from "@workspace/ui/components/ui/spinner";

export default function ComponentsLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}
