import { NextResponse } from "next/server";
import { getCachedStaticSearchDocuments } from "@/lib/docs/cached/search-index";

export async function GET(): Promise<Response> {
  const results = await getCachedStaticSearchDocuments();
  return NextResponse.json(results);
}
