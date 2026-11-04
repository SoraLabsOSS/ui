import { NextResponse } from "next/server";
import { getCachedStaticPageDocuments } from "@/lib/docs/search-index";

export async function GET(): Promise<Response> {
  const results = await getCachedStaticPageDocuments();
  return NextResponse.json(results);
}
