import { PixelBackground } from "@/registry/primitives/effects/pixel-background";

export default function MyPage() {
  return (
    <PixelBackground>
      <div className="flex h-screen items-center justify-center">
        <h1>Your content here</h1>
      </div>
    </PixelBackground>
  );
}
