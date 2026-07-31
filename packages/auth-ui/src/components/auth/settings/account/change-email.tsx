"use client";

import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react";
import { Button } from "@workspace/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/ui/card";
import { Field, FieldError } from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import { Label } from "@workspace/ui/components/ui/label";
import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { type SyntheticEvent, useState } from "react";

export interface ChangeEmailProps {
  className?: string;
}

/**
 * Render a card containing a form to view and update the authenticated user's email.
 *
 * Shows a loading skeleton until session data is available, displays the current
 * email as the form's default value, and sends a verification email to the
 * new address upon successful submission.
 *
 * @returns A JSX element rendering the change-email card and form
 */
export function ChangeEmail({ className }: ChangeEmailProps) {
  const { authClient, baseURL, localization, viewPaths } = useAuth();
  const { data: session } = useSession(authClient);

  const { mutate: changeEmail, isPending } = useChangeEmail(authClient, {
    onSuccess: () => toast.success(localization.settings.changeEmailSuccess),
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
  }>({});

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    changeEmail({
      newEmail: formData.get("email") as string,
      callbackURL: `${baseURL}/${viewPaths.settings.account}`,
    });
  }

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">
        {localization.settings.changeEmail}
      </h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            <Field data-invalid={!!fieldErrors.email}>
              <Label htmlFor="email">{localization.auth.email}</Label>

              {session ? (
                <Input
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  defaultValue={session?.user.email}
                  disabled={isPending}
                  id="email"
                  key={session?.user.email}
                  name="email"
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: (e.target as HTMLInputElement).validationMessage,
                    }));
                  }}
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  type="email"
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>
          </CardContent>

          <CardFooter>
            <Button disabled={isPending || !session} size="sm" type="submit">
              {isPending && <Spinner />}

              {localization.settings.updateEmail}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
