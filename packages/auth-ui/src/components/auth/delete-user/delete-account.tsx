"use client";

import { authQueryKeys } from "@better-auth-ui/core";
import {
  useAuth,
  useAuthPlugin,
  useDeleteUser,
  useListAccounts,
} from "@better-auth-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUserPlugin } from "@workspace/auth-ui/lib/auth/delete-user-plugin";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/ui/alert-dialog";
import { Button } from "@workspace/ui/components/ui/button";
import { Card, CardContent } from "@workspace/ui/components/ui/card";
import { Field, FieldError } from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import { Label } from "@workspace/ui/components/ui/label";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { TriangleAlert } from "lucide-react";
import { type SyntheticEvent, useState } from "react";

export interface DeleteAccountProps {
  className?: string;
}

/**
 * Danger-zone card to delete the authenticated account, with a confirmation dialog and toasts.
 */
export function DeleteAccount({ className }: DeleteAccountProps) {
  const { authClient, basePaths, localization, viewPaths, navigate } =
    useAuth();

  const {
    localization: deleteUserLocalization,
    sendDeleteAccountVerification,
  } = useAuthPlugin(deleteUserPlugin);

  const { data: accounts } = useListAccounts(authClient);

  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  );
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount;

  const { mutate: deleteUser, isPending } = useDeleteUser(authClient);

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open);
    setPassword("");
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = {
      ...(needsPassword ? { password } : {}),
    };

    deleteUser(params, {
      onSuccess: () => {
        setConfirmOpen(false);
        setPassword("");

        if (sendDeleteAccountVerification) {
          toast.success(deleteUserLocalization.deleteUserVerificationSent);
        } else {
          toast.success(deleteUserLocalization.deleteUserSuccess);
          queryClient.removeQueries({ queryKey: authQueryKeys.all });
          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
            replace: true,
          });
        }
      },
    });
  };

  return (
    <Card className={cn("border-destructive", className)}>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-sm leading-tight">
            {deleteUserLocalization.deleteAccount}
          </p>

          <p className="mt-0.5 text-muted-foreground text-xs">
            {deleteUserLocalization.deleteAccountDescription}
          </p>
        </div>

        <AlertDialog onOpenChange={handleDialogOpenChange} open={confirmOpen}>
          <AlertDialogTrigger asChild>
            <Button disabled={!accounts} size="sm" variant="destructive">
              {deleteUserLocalization.deleteAccount}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <TriangleAlert />
                </AlertDialogMedia>

                <AlertDialogTitle>
                  {deleteUserLocalization.deleteAccount}
                </AlertDialogTitle>

                <AlertDialogDescription>
                  {deleteUserLocalization.deleteAccountDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {needsPassword && (
                <Field>
                  <Label htmlFor="delete-password">
                    {localization.auth.password}
                  </Label>

                  <Input
                    autoComplete="current-password"
                    disabled={isPending}
                    id="delete-password"
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={localization.auth.passwordPlaceholder}
                    required
                    type="password"
                    value={password}
                  />

                  <FieldError />
                </Field>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  {localization.settings.cancel}
                </AlertDialogCancel>

                <Button
                  disabled={isPending}
                  type="submit"
                  variant="destructive"
                >
                  {isPending && <Spinner />}

                  {deleteUserLocalization.deleteAccount}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
