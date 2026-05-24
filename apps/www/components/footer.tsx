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
        <div className="max-w-7xl mx-auto h-16">
          <div className="size-full px-4 md:px-6 flex items-center justify-center prose prose-sm text-sm text-muted-foreground">
            <p className="text-center truncate">
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
