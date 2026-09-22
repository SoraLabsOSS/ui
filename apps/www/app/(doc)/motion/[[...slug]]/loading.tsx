import bones from "@/bones/motion-page.bones.json";
import { DocsBoneyardServer } from "@/components/docs/docs-boneyard-server";

export default function MotionLoading() {
  return <DocsBoneyardServer bones={bones} name="motion-page" />;
}
