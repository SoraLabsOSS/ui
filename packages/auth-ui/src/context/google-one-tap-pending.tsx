"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface GoogleOneTapPendingContextValue {
  isPending: boolean;
  setIsPending: (pending: boolean) => void;
}

const noop = () => {
  /* no-op when provider is absent */
};

const GoogleOneTapPendingContext =
  createContext<GoogleOneTapPendingContextValue | null>(null);

export function GoogleOneTapPendingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isPending, setIsPending] = useState(false);

  const value = useMemo(() => ({ isPending, setIsPending }), [isPending]);

  return (
    <GoogleOneTapPendingContext.Provider value={value}>
      {children}
    </GoogleOneTapPendingContext.Provider>
  );
}

/** Whether a Google One Tap sign-in request is in flight. */
export function useGoogleOneTapPending(): boolean {
  return useContext(GoogleOneTapPendingContext)?.isPending ?? false;
}

/** Set One Tap pending state from the One Tap integration (e.g. apps/www). */
export function useGoogleOneTapPendingControls(): {
  setIsPending: (pending: boolean) => void;
} {
  const context = useContext(GoogleOneTapPendingContext);

  return {
    setIsPending: context?.setIsPending ?? noop,
  };
}
