/**
 * Base path configuration for authentication, settings, and organization routes.
 */
export type BasePaths = {
  /**
   * Base path for authentication routes
   * @default "/auth"
   */
  auth: string;
  /**
   * Base path for settings routes
   * @default "/settings"
   */
  settings: string;
  /**
   * Base path for organization management routes
   * @default "/organization"
   */
  organization: string;
};

export const basePaths: BasePaths = {
  auth: "/auth",
  settings: "/settings",
  organization: "/organization",
};
