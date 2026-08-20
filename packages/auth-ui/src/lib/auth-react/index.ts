/**
 * Vendored from @better-auth-ui/react@1.6.17 (MIT).
 * @see sandbox/MIGRATION-drop-better-auth-ui.md
 */
"use client";

// biome-ignore lint/performance/noBarrelFile: public entry for vendored auth-react subset
export * from "./components/auth/auth-provider";
export * from "./components/auth/fetch-options-provider";
export * from "./hooks/auth/use-authenticate";
export * from "./hooks/use-auth-plugin";
export type * from "./lib/auth-client";
export * from "./lib/auth-plugin";
export * from "./lib/provider-icons";
export * from "./lib/settings-tab";
export * from "./mutations/auth/request-password-reset-mutation";
export * from "./mutations/auth/reset-password-mutation";
export * from "./mutations/auth/send-verification-email-mutation";
export * from "./mutations/auth/sign-in-email-mutation";
export * from "./mutations/auth/sign-in-social-mutation";
export * from "./mutations/auth/sign-out-mutation";
export * from "./mutations/auth/sign-up-email-mutation";
export * from "./mutations/multi-session/set-active-session-mutation";
export * from "./mutations/settings/change-email-mutation";
export * from "./mutations/settings/change-password-mutation";
export * from "./mutations/settings/delete-user-mutation";
export * from "./mutations/settings/link-social-mutation";
export * from "./mutations/settings/revoke-session-mutation";
export * from "./mutations/settings/unlink-account-mutation";
export * from "./mutations/settings/update-user-mutation";
export * from "./queries/session-query";
export * from "./queries/settings/account-info-query";
export * from "./queries/settings/list-accounts-query";
export * from "./queries/settings/list-sessions-query";
