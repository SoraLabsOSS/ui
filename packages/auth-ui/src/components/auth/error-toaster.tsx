"use client";

import {
  matchMutation,
  matchQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  authMutationKeys,
  authQueryKeys,
} from "@workspace/auth-ui/lib/auth-core";
import { toast } from "@workspace/ui/components/ui/sonner";
import type { BetterFetchError } from "better-auth/react";
import { useEffect } from "react";

export function ErrorToaster() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const queryCache = queryClient.getQueryCache();
    const previousQueryOnError = queryCache.config.onError;

    queryCache.config.onError = (error, query) => {
      previousQueryOnError?.(error, query);

      if (!matchQuery({ queryKey: authQueryKeys.all }, query)) {
        return;
      }

      const err = error as BetterFetchError;
      if (err?.error?.code === "EMAIL_NOT_VERIFIED") {
        return;
      }
      if (err?.error) {
        toast.error(err.error.message);
      }
    };

    const mutationCache = queryClient.getMutationCache();
    const previousMutationOnError = mutationCache.config.onError;

    mutationCache.config.onError = (
      error,
      variables,
      onMutateResult,
      mutation,
      context
    ) => {
      previousMutationOnError?.(
        error,
        variables,
        onMutateResult,
        mutation,
        context
      );

      if (!matchMutation({ mutationKey: authMutationKeys.all }, mutation)) {
        return;
      }

      const err = error as BetterFetchError;
      if (err.error?.code === "EMAIL_NOT_VERIFIED") {
        return;
      }
      toast.error(err.error?.message || err.message);
    };

    return () => {
      queryCache.config.onError = previousQueryOnError;
      mutationCache.config.onError = previousMutationOnError;
    };
  }, [queryClient]);

  return null;
}
