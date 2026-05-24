import { Dancing_Script } from 'next/font/google';
import { MotionEffect } from './effects/motion-effect';
import { cn } from '@workspace/ui/lib/utils';
import { Components } from './icons/components';
import { Blocks } from './icons/blocks';
import Link from 'next/link';
import { motion } from 'motion/react';

const COMPONENTS = [
  {
    name: 'Components',
    href: '/docs/components',
    icon: <Components />,
  },
  {
    name: 'Soon...',
    icon: (
      <div className="relative">
        <Blocks />
      </div>
    ),
  },
];

const dancing = Dancing_Script({ subsets: ['latin'] });

export const Features = () => {
  return (
    <div className="relative pt-16 pb-10 px-5 flex flex-col items-center justify-center mt-auto">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:gap-6 gap-4 w-full max-w-4xl mx-auto">
        {COMPONENTS.map((component, index) => {
          const Component = component.href ? Link : 'div';
          return (
            <MotionEffect
              slide={{
                direction: 'down',
              }}
              fade
              zoom
              delay={1 + 0.15 * index}
              key={index}
            >
              {/* @ts-ignore */}
              <Component {...(component.href ? { href: component.href } : {})}>
                <motion.div
                  whileHover={{
                    scale: component.href ? 1.025 : 1,
                  }}
                  whileTap={{
                    scale: component.href ? 0.925 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className={cn(
                    'relative w-full dark:bg-neutral-800 bg-neutral-100 rounded-2xl pt-1',
                    !component?.href && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <p
                    className={cn(
                      dancing.className,
                      'text-[22px] font-black text-muted-foreground absolute xs:top-2 top-3 left-1/2 -translate-x-1/2',
                    )}
                  >
                    {component.name}
                  </p>

                  {component.icon}
                </motion.div>
              </Component>
            </MotionEffect>
          );
        })}
      </div>
    </div>
  );
};
