"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { ComponentsExperimentalDialog } from "./components-experimental-dialog";

const STORAGE_KEY = "sora:components-experimental-ack";

interface ComponentsExperimentalGateProps {
  children: ReactNode;
}

export function ComponentsExperimentalGate({
  children,
}: ComponentsExperimentalGateProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem(STORAGE_KEY) === "true";
      if (!acknowledged) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const handleContinue = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Private browsing or disabled storage — still allow access this session.
    }
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  return (
    <>
      {children}
      <ComponentsExperimentalDialog
        onContinue={handleContinue}
        onOpenChange={handleOpenChange}
        open={open}
      />
    </>
  );
}
