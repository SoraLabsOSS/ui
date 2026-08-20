import { createAuthPlugin } from "../../lib/create-auth-plugin";
import {
  type DeleteUserLocalization,
  deleteUserLocalization,
} from "./delete-user-localization";

export type DeleteUserPluginOptions = {
  /**
   * When `true`, matches server `sendDeleteAccountVerification`: deletion starts by sending a
   * verification email instead of deleting immediately in this request.
   */
  sendDeleteAccountVerification?: boolean;
  /**
   * Override the plugin's default localization strings.
   * @remarks `DeleteUserLocalization`
   */
  localization?: Partial<DeleteUserLocalization>;
};

export const deleteUserPlugin = createAuthPlugin(
  "deleteUser",
  (options: DeleteUserPluginOptions = {}) => ({
    localization: { ...deleteUserLocalization, ...options.localization },
    sendDeleteAccountVerification:
      options.sendDeleteAccountVerification ?? false,
  })
);
