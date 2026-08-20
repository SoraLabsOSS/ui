"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

/** Subset of BetterFetchOptions we expose. Add fields as use-cases arise. */
export type FetchOptions = {
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
};

type FetchOptionsContextValue = {
  /** Current fetchOptions, or `undefined` when none are set. */
  fetchOptions: FetchOptions | undefined;
  /** OVERRIDES the entire fetchOptions object. Pass `undefined` to clear. */
  setFetchOptions: (fetchOptions: FetchOptions | undefined) => void;
  /** Clears `fetchOptions` and runs the registered reset (e.g. captcha widget). Call from form `onError`. */
  resetFetchOptions: () => void;
  /** Register a reset handler. Used by `captchaPlugin`. Pass `null` to clear. */
  registerReset: (reset: (() => void) | null) => void;
};

const FetchOptionsContext = createContext<FetchOptionsContextValue | undefined>(
  undefined
);

export function FetchOptionsProvider({ children }: PropsWithChildren) {
  const [current, setCurrent] = useState<FetchOptions | undefined>(undefined);
  const resetRef = useRef<(() => void) | null>(null);

  const setFetchOptions = useCallback(
    (fetchOptions: FetchOptions | undefined) => {
      setCurrent(fetchOptions);
    },
    []
  );

  const registerReset = useCallback((reset: (() => void) | null) => {
    resetRef.current = reset;
  }, []);

  const resetFetchOptions = useCallback(() => {
    setCurrent(undefined);
    resetRef.current?.();
  }, []);

  return (
    <FetchOptionsContext.Provider
      value={{
        fetchOptions: current,
        setFetchOptions,
        resetFetchOptions,
        registerReset,
      }}
    >
      {children}
    </FetchOptionsContext.Provider>
  );
}

export function useFetchOptions(): FetchOptionsContextValue {
  const ctx = useContext(FetchOptionsContext);

  if (!ctx) {
    throw new Error(
      "[Better Auth UI] useFetchOptions must be used within FetchOptionsProvider"
    );
  }

  return ctx;
}
