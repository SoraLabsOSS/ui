import { Loader } from "lucide-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function AuthLoading() {
  return (
    <AuthPageShell>
      <div className="text-muted-foreground flex text-sm">
        <Loader aria-hidden className="mr-2 size-4 animate-spin" />
      </div>
    </AuthPageShell>
  );
}
