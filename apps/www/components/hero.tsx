import { motion } from 'motion/react';
import ReactIcon from '@workspace/ui/components/icons/react-icon';
import TSIcon from '@workspace/ui/components/icons/ts-icon';
import TailwindIcon from '@workspace/ui/components/icons/tailwind-icon';
import MotionIcon from '@workspace/ui/components/icons/motion-icon';
import ShadcnIcon from '@workspace/ui/components/icons/shadcn-icon';
import { Button } from '@workspace/ui/components/ui/button';
import { TextShimmer } from '@workspace/ui/components/ui/text-shimmer';
import Link from 'next/link';
import { MotionEffect } from './effects/motion-effect';
import { ArrowRight } from 'lucide-react';

const SplittingText = ({
  text,
  className,
  type = 'chars',
  delay = 0,
  initial,
  animate,
  transition,
  disableAnimation = false,
  ...props
}: {
  text: string;
  className?: string;
  type?: 'chars' | 'words';
  delay?: number;
  initial?: any;
  animate?: any;
  transition?: any;
  disableAnimation?: boolean;
  [key: string]: any;
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay / 1000,
        staggerChildren: type === 'chars' ? 0.05 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: disableAnimation ? animate : (initial ?? { x: 150, opacity: 0 }),
    visible: {
      ...animate,
      transition: disableAnimation
        ? { duration: 0 }
        : (transition ?? { duration: 0.7, ease: 'easeOut' }),
    },
  };

  const tokens = text.split(/(\s+)/);
  let globalIndex = 0;

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
      {...props}
    >
      {tokens.map((tok, wi) => {
        if (/^\s+$/.test(tok)) {
          return <span key={`space-${wi}`}>{tok}</span>;
        }
        const chars = Array.from(tok);
        const wordDelay = delay / 1000 + 0.03 * globalIndex;
        globalIndex += chars.length;

        return (
          <motion.span
            key={`word-${wi}`}
            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
            variants={{}}
            transition={{ delayChildren: wordDelay, staggerChildren: 0.03 }}
            initial="hidden"
            animate="visible"
          >
            {chars.map((ch, ci) => (
              <motion.span
                key={`ch-${wi}-${ci}`}
                variants={itemVariants}
                style={{ display: 'inline-block' }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        );
      })}
    </motion.span>
  );
};

const ICONS = [ReactIcon, TSIcon, TailwindIcon, MotionIcon, ShadcnIcon];
const TITLE = 'Animate your UI with smooth style';

export const Hero = () => {
  return (
    <div className="relative flex flex-col items-center overflow-hidden px-5">
      <div className="relative z-10 flex flex-col items-center justify-center pt-30">
        <MotionEffect
          slide={{
            direction: 'down',
          }}
          fade
          zoom
          inView
        >
          <div className="bg-accent mb-8 flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm">
            <Link
              href="/docs/installation"
              className="hover:text-foreground flex items-center gap-2 text-neutral-600 transition-colors dark:text-neutral-400"
            >
              <span className="bg-primary text-primary-foreground flex h-6 items-center justify-center rounded-full px-2 text-xs font-medium">
                CLI
              </span>
              <TextShimmer
                as="code"
                className="font-mono text-xs sm:text-sm"
                duration={3}
              >
                npx shadcn@latest add @sora-ui
              </TextShimmer>
            </Link>
          </div>
        </MotionEffect>

        <MotionEffect
          slide={{
            direction: 'down',
          }}
          fade
          zoom
          inView
          delay={0.15}
        >
          <div className="relative z-10">
            <h1 className="max-w-[320px] md:max-w-[800px]">
              <SplittingText
                text={TITLE}
                aria-hidden="true"
                className="block text-center text-4xl font-medium text-neutral-200 md:text-5xl dark:text-neutral-800"
                disableAnimation
              />
            </h1>
            <div className="absolute inset-0 flex max-w-[320px] items-center justify-center md:max-w-[800px]">
              <SplittingText
                text={TITLE}
                className="block text-center text-4xl font-medium md:text-5xl"
                type="chars"
                delay={400}
                initial={{ y: 0, opacity: 0, x: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </MotionEffect>

        <MotionEffect
          slide={{
            direction: 'down',
          }}
          fade
          zoom
          inView
          delay={0.3}
        >
          <p className="text-muted-foreground mt-3 block text-center text-sm font-normal text-balance sm:max-w-[450px] sm:text-base md:max-w-[660px] md:text-lg">
            A fully animated, open-source React component distribution. Browse a
            list of animated components you can install and use in your
            projects.
          </p>
        </MotionEffect>

        <div className="mt-5 mb-8 flex flex-col gap-3 max-sm:w-full sm:flex-row sm:gap-4">
          <MotionEffect
            slide={{
              direction: 'down',
            }}
            fade
            zoom
            delay={0.45}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="w-full !pr-5"
                variant="default"
                asChild
              >
                <Link href="/docs/installation">
                  Get Started <ArrowRight className="ml-1.5 !size-5" />
                </Link>
              </Button>
            </motion.div>
          </MotionEffect>

          <MotionEffect
            slide={{
              direction: 'down',
            }}
            fade
            zoom
            delay={0.6}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="w-full" variant="accent" asChild>
                <Link href="/docs/texts/text-reveal">Browse Components</Link>
              </Button>
            </motion.div>
          </MotionEffect>
        </div>

        <div className="flex items-center justify-center gap-4 sm:justify-start">
          {ICONS.map((Icon, index) => (
            <MotionEffect
              key={index}
              slide={{
                direction: 'down',
              }}
              fade
              zoom
              delay={0.75 + index * 0.1}
            >
              <Icon className="size-8" />
            </MotionEffect>
          ))}
        </div>
      </div>
    </div>
  );
};
