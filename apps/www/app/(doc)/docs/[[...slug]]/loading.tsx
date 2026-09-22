import bones from "@/bones/docs-page.bones.json";
import { DocsBoneyardServer } from "@/components/docs/docs-boneyard-server";

export default function DocsLoading() {
  return <DocsBoneyardServer bones={bones} name="docs-page" />;
}
