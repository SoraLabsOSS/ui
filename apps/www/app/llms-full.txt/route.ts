import { getLLMText } from "@/lib/docs/get-llm-text";
import { source } from "@/lib/docs/source";

async function getLLMsContent() {
  "use cache";
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);
  return scanned.join("\n\n");
}

export async function GET() {
  const content = await getLLMsContent();
  return new Response(content);
}
