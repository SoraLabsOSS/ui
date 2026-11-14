"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { ComponentGalleryItem } from "@/lib/registry/types";

interface BlocksMenuContextValue {
  close: () => void;
  navItems: ComponentGalleryItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const BlocksMenuContext = createContext<BlocksMenuContextValue | null>(null);

export function BlocksMenuProvider({
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
      document.documentElement.dataset.blocksMenuOpen = "";
    } else {
      delete document.documentElement.dataset.blocksMenuOpen;
    }

    return () => {
      delete document.documentElement.dataset.blocksMenuOpen;
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
    <BlocksMenuContext.Provider value={value}>
      {children}
    </BlocksMenuContext.Provider>
  );
}

export function useBlocksMenu() {
  const context = useContext(BlocksMenuContext);
  if (!context) {
    throw new Error("useBlocksMenu must be used within BlocksMenuProvider");
  }
  return context;
}
