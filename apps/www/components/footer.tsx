import { MotionEffect } from './effects/motion-effect';

export const Footer = () => {
  return (
    <MotionEffect
      slide={{
        direction: 'down',
      }}
      fade
      zoom
      delay={1.6}
    >
      <div className="w-full">
        <div className="mx-auto h-16 max-w-7xl">
          <div className="prose prose-sm text-muted-foreground flex size-full items-center justify-center px-4 text-sm md:px-6">
            <p className="truncate text-center whitespace-normal">
              Built by{' '}
              <a
                href="https://github.com/Axyl1410"
                rel="noopener noreferrer"
                target="_blank"
              >
                Axyl
              </a>
              . The source code will be available on GitHub soon.
            </p>
          </div>
        </div>
      </div>
    </MotionEffect>
  );
};
