import { DangerZone } from "@workspace/auth-ui/components/auth/delete-user/danger-zone";
import { createAuthPlugin } from "@workspace/auth-ui/lib/auth-core";
import {
  deleteUserPlugin as coreDeleteUserPlugin,
  type DeleteUserPluginOptions,
} from "@workspace/auth-ui/lib/auth-core/plugins";

export const deleteUserPlugin = createAuthPlugin(
  coreDeleteUserPlugin.id,
  (options: DeleteUserPluginOptions = {}) => ({
    ...coreDeleteUserPlugin(options),
    securityCards: [DangerZone],
  })
);
