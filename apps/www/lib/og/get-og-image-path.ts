/** Path to the dynamic OG image route (`/docs-og/.../image.png`). */
export function getOgImagePath(...segments: string[]): string {
  if (segments.length === 0) {
    return "/docs-og/image.png";
  }

  return ["/docs-og", ...segments, "image.png"].join("/");
}
