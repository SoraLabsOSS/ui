"use client";

import { motion } from "motion/react";
import Image from "next/image";

/**
 * Right-side marketing panel for the sign-in page: sleek ambient background,
 * a testimonial, and a mockup preview — mirrors the Sora Studio sign-up split layout.
 */
export function SignInMarketingPanel() {
  return (
    <div className="relative hidden flex-col overflow-hidden rounded-md border border-white/10 bg-zinc-950 p-8 text-white sm:p-12 lg:flex lg:min-h-0 lg:p-16">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-black" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:32px_32px]" />

      <div className="relative z-10 h-full w-full">
        <div className="max-w-[460px] lg:pt-12">
          <motion.div
            className="flex items-center gap-4"
            initial={{ filter: "blur(6px)", opacity: 0, y: 12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ margin: "-10%", once: true }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          >
            <Image
              alt="Axyl1410"
              className="size-10 shrink-0 rounded-full border border-white/20 object-cover"
              height={40}
              src="https://avatars.githubusercontent.com/u/142161991?s=400&u=dd40d6056600c4e7da605a618cfecea2f7c3da76&v=4"
              width={40}
            />
            <div>
              <div className="leading-tight font-semibold text-white">
                Axyl1410
              </div>
              <div className="mt-0.5 text-xs text-white/60">
                Full Stack Developer
              </div>
            </div>
          </motion.div>
          <motion.blockquote
            className="mt-7 text-2xl leading-tight font-light tracking-[-0.035em] text-white/90 sm:text-3xl lg:text-[34px]"
            initial={{ filter: "blur(8px)", opacity: 0, y: 18 }}
            transition={{
              delay: 0.12,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            viewport={{ margin: "-10%", once: true }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          >
            &ldquo;Copy a primitive, tweak a couple props, and it already feels
            like a week of animation polish.&rdquo;
          </motion.blockquote>
        </div>

        <div className="mt-10 w-full translate-y-[24%] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:translate-y-[22%] lg:absolute lg:-bottom-28 lg:left-[12%] lg:mt-0 lg:w-[105%] lg:max-w-none lg:origin-bottom-left lg:translate-y-0 lg:-rotate-3 xl:-bottom-[150px] xl:left-[14%] xl:w-[108%] 2xl:-bottom-[170px] 2xl:w-[112%]">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-4 py-3 select-none">
            <div className="size-2 rounded-full bg-white/35" />
            <div className="size-2 rounded-full bg-white/25" />
            <div className="size-2 rounded-full bg-white/15" />
            <span className="ml-4 font-mono text-[9px] tracking-wider text-white/40">
              ui.soralabs.studio
            </span>
          </div>
          <Image
            alt="Sora Studio landing page preview"
            className="-ml-[0.5%] h-auto w-[103%] max-w-none object-cover object-top opacity-95 filter-[invert(1)_hue-rotate(180deg)_brightness(0.68)_contrast(1.16)]"
            draggable={false}
            height={1080}
            loading="eager"
            src="/dashboard-mockup-signin.png"
            width={1920}
          />
        </div>
      </div>
    </div>
  );
}
