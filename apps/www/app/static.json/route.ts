import { NextResponse } from "next/server";
import { getStaticSearchDocuments } from "@/lib/docs/search-index";

async function getStaticSearchData() {
  "use cache";
  return await Promise.resolve(getStaticSearchDocuments());
}

export async function GET(): Promise<Response> {
  const results = await getStaticSearchData();
  return NextResponse.json(results);
}
