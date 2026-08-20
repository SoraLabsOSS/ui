import type { SettingsView } from "@workspace/auth-ui/lib/auth-core";
import type { ComponentType, ReactNode } from "react";

/**
 * Tab contributions for the settings page.
 *
 * Plugins declare `settingsTabs` on their object to add extra tabs.
 * Read at runtime via `useAuthPlugin(plugin).settingsTabs`.
 */
export interface SettingsTab {
  /** Component rendered in the tab panel */
  // biome-ignore lint/suspicious/noExplicitAny: any
  component: ComponentType<any>;
  /** Display label */
  label: ReactNode;
  /**
   * Settings view id — must match a key on `plugin.viewPaths.settings` and
   * {@link SettingsView} (including keys added via `declare module` augmentation).
   */
  view: SettingsView;
}
