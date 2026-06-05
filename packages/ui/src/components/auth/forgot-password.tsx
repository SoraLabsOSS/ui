"use client";

import {
  useAuth,
  useFetchOptions,
  useRequestPasswordReset,
} from "@better-auth-ui/react";
import { Button } from "@workspace/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import { Label } from "@workspace/ui/components/ui/label";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { type SyntheticEvent, useState } from "react";

export type ForgotPasswordProps = {
  className?: string;
};

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * Toasts are displayed on success or error via the `useForgotPassword` hook.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className }: ForgotPasswordProps) {
  const {
    authClient,
    baseURL,
    basePaths,
    localization,
    plugins,
    viewPaths,
    Link,
  } = useAuth();

  const { fetchOptions, resetFetchOptions } = useFetchOptions();

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset(
    authClient,
    {
      onError: () => {
        resetFetchOptions();
      },
      onSuccess: () => toast.success(localization.auth.passwordResetEmailSent),
    }
  );

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    requestPasswordReset({
      email: formData.get("email") as string,
      redirectTo: `${baseURL}${basePaths.auth}/${viewPaths.auth.resetPassword}`,
      fetchOptions,
    });
  }

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent;

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
  }>({});

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">
          {localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.email}>
              <Label htmlFor="email">{localization.auth.email}</Label>

              <Input
                aria-invalid={!!fieldErrors.email}
                autoComplete="email"
                disabled={isPending}
                id="email"
                name="email"
                onChange={() => {
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: undefined,
                  }));
                }}
                onInvalid={(e) => {
                  e.preventDefault();
                  const el = e.target as HTMLInputElement;
                  const msg = el.validity.valueMissing
                    ? localization.auth.fieldRequired
                    : localization.auth.invalidEmail;

                  setFieldErrors((prev) => ({
                    ...prev,
                    email: msg,
                  }));
                }}
                placeholder={localization.auth.emailPlaceholder}
                required
                type="email"
              />

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>

            {Captcha && <div className="flex justify-center">{Captcha}</div>}

            <div className="flex flex-col gap-3">
              <Button disabled={isPending} type="submit">
                {isPending && <Spinner />}

                {localization.auth.sendResetLink}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              className="underline underline-offset-4"
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  );
}
