"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface BlocksMobileChromeContextValue {
  setToolbar: (toolbar: ReactNode) => void;
  toolbar: ReactNode;
}

const BlocksMobileChromeContext =
  createContext<BlocksMobileChromeContextValue | null>(null);

export function BlocksMobileChromeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toolbar, setToolbar] = useState<ReactNode>(null);
  const value = useMemo(() => ({ setToolbar, toolbar }), [toolbar]);

  return (
    <BlocksMobileChromeContext.Provider value={value}>
      {children}
    </BlocksMobileChromeContext.Provider>
  );
}

export function useBlocksMobileChrome() {
  const context = useContext(BlocksMobileChromeContext);

  if (!context) {
    throw new Error(
      "useBlocksMobileChrome must be used within BlocksMobileChromeProvider"
    );
  }

  return context;
}
