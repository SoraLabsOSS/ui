"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface CatalogMobileChromeContextValue {
  setToolbar: (toolbar: ReactNode) => void;
  toolbar: ReactNode;
}

const CatalogMobileChromeContext =
  createContext<CatalogMobileChromeContextValue | null>(null);

export function CatalogMobileChromeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toolbar, setToolbar] = useState<ReactNode>(null);
  const value = useMemo(() => ({ setToolbar, toolbar }), [toolbar]);

  return (
    <CatalogMobileChromeContext.Provider value={value}>
      {children}
    </CatalogMobileChromeContext.Provider>
  );
}

export function useCatalogMobileChrome() {
  const context = useContext(CatalogMobileChromeContext);

  if (!context) {
    throw new Error(
      "useCatalogMobileChrome must be used within CatalogMobileChromeProvider"
    );
  }

  return context;
}
