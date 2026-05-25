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
    <div className="relative mt-auto flex flex-col items-center justify-center px-5 pt-16 pb-10">
      <div className="xs:grid-cols-2 mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:gap-6">
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
                    'relative w-full rounded-2xl bg-neutral-100 pt-1 dark:bg-neutral-800',
                    !component?.href && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <p
                    className={cn(
                      dancing.className,
                      'text-muted-foreground xs:top-2 absolute top-3 left-1/2 -translate-x-1/2 text-[22px] font-black',
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
