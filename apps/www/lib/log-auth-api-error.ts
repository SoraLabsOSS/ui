/**
 * Structured server log for Better Auth `onAPIError.onError`.
 */
export function logAuthApiError(error: unknown): void {
  if (error instanceof Error) {
    console.error("[auth]", {
      name: error.name,
      message: error.message,
      cause:
        error.cause instanceof Error
          ? {
              name: error.cause.name,
              message: error.cause.message,
            }
          : error.cause,
    });
    return;
  }

  console.error("[auth]", error);
}
