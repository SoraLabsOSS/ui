/** biome-ignore-all lint/suspicious/noArrayIndexKey: digit positions are stable within a remounted count string */

"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Bell } from "@/registry/icons/bell";

/**
 * Full notification-bell widget demo (not a registry primitive).
 * Uses the registry `Bell` icon for the glyph; badge / sound / controls live here.
 */

function useArrivalSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) {
        return;
      }
      let ctx = ctxRef.current;
      if (!ctx) {
        ctx = ctxRef.current = new AC();
      }
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => undefined);
      }
      const audio = ctx;
      const now = audio.currentTime;
      const tone = (freq: number, at: number, dur: number, peak: number) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + at);
        gain.gain.setValueAtTime(0.0001, now + at);
        gain.gain.exponentialRampToValueAtTime(peak, now + at + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
        osc.connect(gain).connect(audio.destination);
        osc.start(now + at);
        osc.stop(now + at + dur + 0.02);
      };
      tone(987.77, 0, 0.18, 0.06);
      tone(1318.51, 0.08, 0.22, 0.05);
    } catch {
      /* AudioContext blocked/unavailable — fail silent */
    }
  }, [enabled]);
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M4 7.99999H5.2759C5.74377 7.99999 6.19684 7.83596 6.55627 7.53643L10.3598 4.36681C11.0111 3.82403 12 4.28719 12 5.13503V18.8649C12 19.7128 11.0111 20.1759 10.3598 19.6332L6.55627 16.4635C6.19684 16.164 5.74377 16 5.2759 16H4C2.89543 16 2 15.1046 2 14V9.99999C2 8.89542 2.89543 7.99999 4 7.99999Z" />
      {muted ? (
        <path d="M21.5 9.99999L19.3787 12.1213M19.3787 12.1213L17.2574 14.2426M19.3787 12.1213L17.2574 9.99999M19.3787 12.1213L21.5 14.2426" />
      ) : (
        <path d="M15.8891 8.11132C16.8844 9.10662 17.5 10.4816 17.5 12.0004C17.5 13.5192 16.8844 14.8942 15.8891 15.8895" />
      )}
    </svg>
  );
}

export function NotificationBell() {
  const reduce = useReducedMotion() ?? false;
  const [count, setCount] = useState(0);
  const [muted, setMuted] = useState(false);
  const bellControls = useAnimationControls();
  const badgeControls = useAnimationControls();
  const playArrival = useArrivalSound(!muted);

  const display = count > 9 ? "9+" : String(count);

  const rattle = {
    rotate: [0, -8, 4, -2, 1, -0.5, 0.25, 0],
    transition: { duration: 0.6, ease: "easeInOut" as const },
  };
  const badgeReact = {
    scale: [1, 1.15, 0.94, 1.04, 1],
    rotate: [0, -6, 4, -1.5, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      delay: 0.08,
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  };

  const EASE_CLOSE = [0.4, 0, 0.2, 1] as const;
  const badgeV: Variants = {
    hidden: { scale: 0, opacity: 0, filter: "blur(2px)", x: -8, y: 12 },
    visible: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : {
            scale: { type: "spring", duration: 0.5, bounce: 0.5 },
            x: { type: "spring", duration: 0.5, bounce: 0.3 },
            y: { type: "spring", duration: 0.5, bounce: 0.3 },
            opacity: { duration: 0.3 },
            filter: { duration: 0.3 },
          },
    },
    exit: {
      scale: 0,
      opacity: 0,
      filter: "blur(2px)",
      transition: { duration: 0.18, ease: EASE_CLOSE },
    },
  };
  const countContainer: Variants = {
    enter: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
    center: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
    exit: {
      transition: {
        staggerChildren: reduce ? 0 : 0.04,
        staggerDirection: -1,
      },
    },
  };
  const charV: Variants = {
    enter: { y: 8, opacity: 0, filter: "blur(2px)" },
    center: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: reduce
        ? { duration: 0 }
        : { type: "spring", duration: 0.45, bounce: 0.4 },
    },
    exit: {
      y: -8,
      opacity: 0,
      filter: "blur(2px)",
      transition: { duration: 0.18, ease: EASE_CLOSE },
    },
  };

  function handleAnimate() {
    const had = count > 0;
    setCount((c) => c + 1);
    if (!reduce) {
      bellControls.start(rattle).catch(() => undefined);
      if (had) {
        badgeControls.start(badgeReact).catch(() => undefined);
      }
    }
    playArrival();
  }

  function handleClear() {
    if (count === 0) {
      return;
    }
    setCount(0);
  }

  return (
    <div className="nb-stage">
      <style>{styles}</style>

      <motion.button
        aria-label={
          count === 0
            ? "Notifications, no new items"
            : `Notifications, ${count} new — activate to clear`
        }
        className="nb-bell-btn"
        onClick={handleClear}
        transition={{ type: "spring", duration: 0.25, bounce: 0.4 }}
        type="button"
        whileTap={reduce ? undefined : { scale: 0.92 }}
      >
        <motion.span
          animate={bellControls}
          className="nb-rotor"
          style={{ transformOrigin: "50% 24%" }}
        >
          <Bell size={44} />
        </motion.span>

        <AnimatePresence>
          {count > 0 ? (
            <motion.span
              animate="visible"
              className="nb-badge"
              exit="exit"
              initial="hidden"
              key="badge"
              variants={badgeV}
            >
              <motion.span animate={badgeControls} className="nb-badge-inner">
                <span className="nb-count-clip">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      animate="center"
                      className="nb-count"
                      exit="exit"
                      initial="enter"
                      key={display}
                      variants={countContainer}
                    >
                      {display.split("").map((ch, i) => (
                        <motion.span
                          className="nb-char"
                          key={`${display}-${i}`}
                          variants={charV}
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>

      <div className="nb-controls">
        <button className="nb-animate" onClick={handleAnimate} type="button">
          Animate
        </button>
        <button
          aria-label={
            muted ? "Unmute notification sound" : "Mute notification sound"
          }
          aria-pressed={muted}
          className="nb-mute"
          onClick={() => setMuted((m) => !m)}
          title={muted ? "Unmute" : "Mute"}
          type="button"
        >
          <SpeakerIcon muted={muted} />
        </button>
      </div>

      <span aria-live="polite" className="nb-sr">
        {count === 0
          ? ""
          : `${count} new ${count === 1 ? "notification" : "notifications"}`}
      </span>
    </div>
  );
}

const styles = `
.nb-stage {
  --nb-badge-bg: light-dark(#ff3b30, #ff453a);
  --nb-badge-text: #ffffff;
  --nb-btn-bg: light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.08));
  --nb-btn-bg-hover: light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.12));
  --nb-ctl-idle: light-dark(rgba(0, 0, 0, 0.4), rgba(255, 255, 255, 0.5));
  --nb-ctl-hover: light-dark(rgba(0, 0, 0, 0.72), rgba(255, 255, 255, 0.85));
  --nb-focus: light-dark(rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.65));

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  font-family: var(--font-sans, "Geist Sans", system-ui, sans-serif);
  color: var(--foreground);
}
.nb-stage *, .nb-stage *::before, .nb-stage *::after { box-sizing: border-box; }

.nb-bell-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  margin: 0;
  border: none;
  background: transparent;
  color: var(--foreground);
  border-radius: 14px;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.nb-bell-btn:focus-visible { box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--nb-focus); }

.nb-rotor { display: inline-flex; will-change: transform; }

.nb-badge {
  position: absolute;
  top: 1px;
  right: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--nb-badge-bg);
  box-shadow: 0 0 0 2px var(--background);
  pointer-events: none;
  will-change: transform, opacity, filter;
}
.nb-badge-inner { display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.nb-count-clip { display: inline-flex; align-items: center; justify-content: center; height: 14px; overflow: hidden; }
.nb-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--nb-badge-text);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}
.nb-char { display: inline-block; will-change: transform, opacity, filter; }

.nb-controls { display: flex; align-items: center; gap: 8px; }
.nb-animate {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
  background: var(--nb-btn-bg);
  border: none;
  border-radius: 999px;
  padding: 9px 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 140ms cubic-bezier(0.4, 0, 0.2, 1), background-color 140ms ease;
}
@media (hover: hover) { .nb-animate:hover { background: var(--nb-btn-bg-hover); } }
.nb-animate:active { transform: scale(0.97); }
.nb-animate:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--nb-focus); }

.nb-mute {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 9px;
  color: var(--nb-ctl-idle);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: color 160ms ease, background 160ms ease;
}
@media (hover: hover) { .nb-mute:hover { color: var(--nb-ctl-hover); background: var(--hover-bg); } }
.nb-mute:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--nb-focus); }

.nb-sr {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .nb-stage *, .nb-stage *::before, .nb-stage *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;
