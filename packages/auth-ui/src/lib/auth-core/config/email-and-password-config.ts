/**
 * Configuration options for email and password authentication.
 */
export type EmailAndPasswordConfig = {
  /**
   * Whether email/password authentication is enabled
   * @default true
   */
  enabled: boolean;
  /**
   * Whether to show a confirm password field on sign-up forms
   */
  confirmPassword?: boolean;
  /**
   * Whether users can reset forgotten passwords
   * @default true
   */
  forgotPassword: boolean;
  /**
   * Maximum password length
   * @default 128
   */
  maxPasswordLength: number;
  /**
   * Minimum password length
   * @default 8
   */
  minPasswordLength: number;
  /**
   * Whether to render the name field on the sign-up form. When `false`,
   * sign-up submits with `name: ""`.
   * @default true
   */
  name?: boolean;
  /** Whether to show a "Remember me" checkbox on sign-in forms */
  rememberMe?: boolean;
  /** Whether email verification is required before account activation */
  requireEmailVerification?: boolean;
};
