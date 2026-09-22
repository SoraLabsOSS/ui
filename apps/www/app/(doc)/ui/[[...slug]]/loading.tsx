import bones from "@/bones/ui-page.bones.json";
import { DocsBoneyardServer } from "@/components/docs/docs-boneyard-server";

export default function UiLoading() {
  return <DocsBoneyardServer bones={bones} name="ui-page" />;
}
