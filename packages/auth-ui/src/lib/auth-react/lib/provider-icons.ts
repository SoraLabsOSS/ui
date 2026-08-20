import type { SocialProvider } from "better-auth/social-providers";
import type { ComponentPropsWithRef, ComponentType } from "react";
import { GitHub, Google } from "../components/icons";

/** Icons for Sora's supported OAuth providers (Google + GitHub). */
export const providerIcons: Partial<
  Record<SocialProvider, ComponentType<ComponentPropsWithRef<"svg">>>
> = {
  github: GitHub,
  google: Google,
};
