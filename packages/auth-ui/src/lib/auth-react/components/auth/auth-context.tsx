"use client";

import type { AuthConfig } from "@workspace/auth-ui/lib/auth-core";
import { createContext } from "react";

/** Split from `auth-provider` so HMR reloading that file does not replace this context instance. */
export const AuthContext = createContext<AuthConfig | undefined>(undefined);
