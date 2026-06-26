import { MotionEffect } from "./effects/motion-effect";

export const Footer = () => (
  <MotionEffect
    delay={1.6}
    fade
    slide={{
      direction: "down",
    }}
    zoom
  >
    <div className="w-full">
      <div className="mx-auto h-16 max-w-7xl">
        <div className="prose prose-sm flex size-full items-center justify-center px-4 text-muted-foreground text-sm md:px-6">
          <p className="truncate whitespace-normal text-center">
            Built by{" "}
            <a
              href="https://github.com/axyl1410/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Axyl
            </a>
            . A motion-first component registry for React.
          </p>
        </div>
      </div>
    </div>
  </MotionEffect>
);
