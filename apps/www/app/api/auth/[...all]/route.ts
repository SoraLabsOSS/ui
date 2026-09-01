import { NextResponse } from "next/server";
import { isAuthEnabled } from "@/env";

export async function GET(request: Request) {
  if (!isAuthEnabled()) {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/get-session")) {
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json(
      { error: "Authentication is disabled" },
      { status: 404 }
    );
  }

  const { toNextJsHandler } = await import("better-auth/next-js");
  const { auth } = await import("@/lib/auth");
  return toNextJsHandler(auth).GET(request);
}

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json(
      { error: "Authentication is disabled" },
      { status: 404 }
    );
  }

  const { toNextJsHandler } = await import("better-auth/next-js");
  const { auth } = await import("@/lib/auth");
  return toNextJsHandler(auth).POST(request);
}
