import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

async function getLLMContentForSlug(slug?: string[]) {
  "use cache";
  const page = source.getPage(slug);
  if (!page) {
    return null;
  }
  return await getLLMText(page);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const content = await getLLMContentForSlug(slug);
  if (!content) {
    notFound();
  }

  return new NextResponse(content);
}

export function generateStaticParams() {
  return source.generateParams();
}
