"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ComponentGalleryItem } from "@/lib/registry/types";

interface CatalogMenuContextValue {
  close: () => void;
  navItems: ComponentGalleryItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CatalogMenuContext = createContext<CatalogMenuContextValue | null>(null);

export function CatalogMenuProvider({
  children,
  navItems,
}: {
  children: ReactNode;
  navItems: ComponentGalleryItem[];
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (open) {
      document.documentElement.dataset.catalogMenuOpen = "";
    } else {
      delete document.documentElement.dataset.catalogMenuOpen;
    }

    return () => {
      delete document.documentElement.dataset.catalogMenuOpen;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  const value = useMemo(
    () => ({
      close,
      navItems,
      open,
      setOpen,
      toggle,
    }),
    [close, navItems, open, toggle]
  );

  return (
    <CatalogMenuContext.Provider value={value}>
      {children}
    </CatalogMenuContext.Provider>
  );
}

export function useCatalogMenu() {
  const context = useContext(CatalogMenuContext);
  if (!context) {
    throw new Error("useCatalogMenu must be used within CatalogMenuProvider");
  }
  return context;
}
