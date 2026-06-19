/** Path to the dynamic OG image route (`/og/.../image.png`). */
export function getOgImagePath(...segments: string[]): string {
  if (segments.length === 0) {
    return "/og/image.png";
  }

  return ["/og", ...segments, "image.png"].join("/");
}
