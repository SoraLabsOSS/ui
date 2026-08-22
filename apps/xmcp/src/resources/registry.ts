import type { ResourceMetadata } from "xmcp";
import { listInstallableItems } from "../registry/sora-registry-source";

export const metadata: ResourceMetadata = {
  name: "registry-catalog",
  title: "Sora UI Component Catalog",
  description: "Complete list of installable Sora UI components and hooks",
  mimeType: "application/json",
};

export default async function handler() {
  const items = await listInstallableItems();
  return JSON.stringify(items, null, 2);
}
