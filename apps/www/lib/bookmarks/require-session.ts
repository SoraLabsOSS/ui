import { headers } from "next/headers";
import { isDatabaseConfigured } from "@/env";
import { auth } from "@/lib/auth";

export async function requireSession() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return session;
}
