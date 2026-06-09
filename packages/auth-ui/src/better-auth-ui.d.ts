import type { AuthPlugin } from "@better-auth-ui/react";

declare module "@better-auth-ui/core" {
  interface AuthPluginRegister {
    authUi: AuthPlugin;
  }
}
