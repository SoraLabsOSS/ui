"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface PreloaderContextValue {
  completeInitialLoad: () => void;
  /** When true, footer reveal is owned by the preloader exit animation. */
  deferFooterReveal: boolean;
  /** Snapshot at provider mount — does not change when preloader completes. */
  initialDeferFooterReveal: boolean;
}

const PreloaderContext = createContext<PreloaderContextValue | null>(null);

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const initialDeferFooterRevealRef = useRef(true);
  const [deferFooterReveal, setDeferFooterReveal] = useState(true);

  const completeInitialLoad = useCallback(() => {
    setDeferFooterReveal(false);
  }, []);

  const value = useMemo(
    () => ({
      deferFooterReveal,
      initialDeferFooterReveal: initialDeferFooterRevealRef.current,
      completeInitialLoad,
    }),
    [deferFooterReveal, completeInitialLoad]
  );

  return (
    <PreloaderContext.Provider value={value}>
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloaderContext() {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error(
      "usePreloaderContext must be used within PreloaderProvider"
    );
  }
  return context;
}
