import bones from "@/bones/blog-index.bones.json";
import { DocsBoneyardServer } from "@/components/docs/docs-boneyard-server";

export default function BlogLoading() {
  return <DocsBoneyardServer bones={bones} name="blog-index" />;
}
