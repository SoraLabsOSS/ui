export type OAuthCallbackContext = "sign-in" | "link";

export interface BuildOAuthCallbackURLsOptions {
  /** App origin, e.g. `https://sora.axyl.io.vn`. */
  baseURL: string;
  /** Distinguishes sign-in vs account-linking copy on the error page. */
  context?: OAuthCallbackContext;
  /** Path for OAuth failures. @default "/auth/error" */
  errorPath?: string;
  /** Preserved for retry links on the error page. */
  redirectTo?: string;
  /** Path (or full app path) to land on after a successful OAuth flow. */
  successPath: string;
}

export interface OAuthCallbackURLs {
  callbackURL: string;
  errorCallbackURL: string;
}

function normalizeAppPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Builds absolute `callbackURL` and `errorCallbackURL` values for Better Auth
 * social sign-in and account-linking flows.
 */
export function buildOAuthCallbackURLs(
  options: BuildOAuthCallbackURLsOptions
): OAuthCallbackURLs {
  const {
    baseURL,
    successPath,
    errorPath = "/auth/error",
    redirectTo,
    context,
  } = options;

  const errorParams = new URLSearchParams();
  if (redirectTo) {
    errorParams.set("redirectTo", redirectTo);
  }
  if (context) {
    errorParams.set("context", context);
  }

  const errorQuery = errorParams.toString();

  return {
    callbackURL: `${baseURL}${normalizeAppPath(successPath)}`,
    errorCallbackURL: `${baseURL}${normalizeAppPath(errorPath)}${
      errorQuery ? `?${errorQuery}` : ""
    }`,
  };
}
