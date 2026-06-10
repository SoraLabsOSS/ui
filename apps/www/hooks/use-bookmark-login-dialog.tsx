"use client";

import { useCallback, useState } from "react";
import { BookmarkLoginDialog } from "@/components/docs/bookmark-login-dialog";

export function useBookmarkLoginDialog() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const openLoginDialog = useCallback((url: string) => {
    setRedirectUrl(url);
  }, []);

  const loginDialog = (
    <BookmarkLoginDialog
      onOpenChange={(open) => {
        if (!open) {
          setRedirectUrl(null);
        }
      }}
      open={redirectUrl !== null}
      redirectUrl={redirectUrl ?? "/"}
    />
  );

  return { loginDialog, openLoginDialog };
}
