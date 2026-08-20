import type { AuthPlugin } from "@workspace/auth-ui/lib/auth-react";

declare module "@workspace/auth-ui/lib/auth-core" {
  interface AuthPluginRegister {
    authUi: AuthPlugin;
  }
}
