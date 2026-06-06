import MotionIcon from "@workspace/ui/components/icons/motion-icon";
import ReactIcon from "@workspace/ui/components/icons/react-icon";
import ShadcnIcon from "@workspace/ui/components/icons/shadcn-icon";
import TailwindIcon from "@workspace/ui/components/icons/tailwind-icon";
import TSIcon from "@workspace/ui/components/icons/ts-icon";
import { Button } from "@workspace/ui/components/ui/button";
import { TextShimmer } from "@workspace/ui/components/ui/text-shimmer";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { MotionEffect } from "./effects/motion-effect";

const SplittingText = ({
  text,
  className,
  type = "chars",
  delay = 0,
  initial,
  animate,
  transition,
  disableAnimation = false,
  ...props
}: {
  text: string;
  className?: string;
  type?: "chars" | "words";
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
        staggerChildren: type === "chars" ? 0.05 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: disableAnimation ? animate : (initial ?? { x: 150, opacity: 0 }),
    visible: {
      ...animate,
      transition: disableAnimation
        ? { duration: 0 }
        : (transition ?? { duration: 0.7, ease: "easeOut" }),
    },
  };

  const tokens = text.split(/(\s+)/);
  let globalIndex = 0;

  return (
    <motion.span
      animate="visible"
      className={className}
      initial="hidden"
      variants={containerVariants}
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
            animate="visible"
            initial="hidden"
            key={`word-${wi}`}
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
            transition={{ delayChildren: wordDelay, staggerChildren: 0.03 }}
            variants={{}}
          >
            {chars.map((ch, ci) => (
              <motion.span
                key={`ch-${wi}-${ci}`}
                style={{ display: "inline-block" }}
                variants={itemVariants}
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
const TITLE = "Animate your UI with smooth style";

export const Hero = () => (
  <div className="relative flex flex-col items-center overflow-hidden px-5">
    <div className="relative z-10 flex flex-col items-center justify-center pt-30">
      <MotionEffect
        fade
        inView
        slide={{
          direction: "down",
        }}
        zoom
      >
        <div className="mb-8 flex items-center gap-2 rounded-full bg-accent py-1 pr-3 pl-1 text-sm">
          <Link
            className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-foreground dark:text-neutral-400"
            href="/docs/installation"
          >
            <span className="flex h-6 items-center justify-center rounded-full bg-primary px-2 font-medium text-primary-foreground text-xs">
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
        delay={0.15}
        fade
        inView
        slide={{
          direction: "down",
        }}
        zoom
      >
        <div className="relative z-10">
          <h1 className="max-w-[320px] md:max-w-[800px]">
            <SplittingText
              aria-hidden="true"
              className="block text-center font-medium text-4xl text-neutral-200 md:text-5xl dark:text-neutral-800"
              disableAnimation
              text={TITLE}
            />
          </h1>
          <div className="absolute inset-0 flex max-w-[320px] items-center justify-center md:max-w-[800px]">
            <SplittingText
              animate={{ y: 0, opacity: 1, x: 0, filter: "blur(0px)" }}
              className="block text-center font-medium text-4xl md:text-5xl"
              delay={400}
              initial={{ y: 0, opacity: 0, x: 0, filter: "blur(10px)" }}
              text={TITLE}
              transition={{ duration: 0.4, ease: "easeOut" }}
              type="chars"
            />
          </div>
        </div>
      </MotionEffect>

      <MotionEffect
        delay={0.3}
        fade
        inView
        slide={{
          direction: "down",
        }}
        zoom
      >
        <p className="mt-3 block text-balance text-center font-normal text-muted-foreground text-sm sm:max-w-[450px] sm:text-base md:max-w-[660px] md:text-lg">
          A fully animated React component library. Browse a list of animated
          components you can install and use in your projects.
        </p>
      </MotionEffect>

      <div className="mt-5 mb-8 flex flex-col gap-3 max-sm:w-full sm:flex-row sm:gap-4">
        <MotionEffect
          delay={0.45}
          fade
          slide={{
            direction: "down",
          }}
          zoom
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              className="!pr-5 w-full"
              size="lg"
              variant="default"
            >
              <Link href="/docs/installation">
                Get Started <ArrowRight className="!size-5 ml-1.5" />
              </Link>
            </Button>
          </motion.div>
        </MotionEffect>

        <MotionEffect
          delay={0.6}
          fade
          slide={{
            direction: "down",
          }}
          zoom
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="w-full" size="lg" variant="accent">
              <Link href="/docs/texts/text-reveal">Browse Components</Link>
            </Button>
          </motion.div>
        </MotionEffect>
      </div>

      <div className="flex items-center justify-center gap-4 sm:justify-start">
        {ICONS.map((Icon, index) => (
          <MotionEffect
            delay={0.75 + index * 0.1}
            fade
            key={index}
            slide={{
              direction: "down",
            }}
            zoom
          >
            <Icon className="size-8" />
          </MotionEffect>
        ))}
      </div>
    </div>
  </div>
);
