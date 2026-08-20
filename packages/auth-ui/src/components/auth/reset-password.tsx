"use client";

import { useAuth, useResetPassword } from "@workspace/auth-ui/lib/auth-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/ui/input-group";
import { Label } from "@workspace/ui/components/ui/label";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { type SyntheticEvent, useEffect, useState } from "react";

export interface ResetPasswordProps {
  className?: string;
}

/**
 * Render a password reset form that validates the reset token from the URL, accepts a new password (and optional confirmation), and submits it to the auth client.
 *
 * The component checks for a `token` query parameter on mount and, if missing, shows an error toast and navigates to the sign-in page. It exposes per-field validation messages, toggles for password visibility, and disables inputs while the reset request is pending.
 *
 * @returns The password reset form UI ready to be mounted in the app layout.
 */
export function ResetPassword({ className }: ResetPasswordProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    viewPaths,
    navigate,
    Link,
  } = useAuth();

  const { mutate: resetPassword, isPending } = useResetPassword(authClient, {
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess);
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
    },
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token") as string;

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken);
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
    }
  }, [
    basePaths.auth,
    localization.auth.invalidResetPasswordToken,
    viewPaths.auth.signIn,
    navigate,
  ]);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token") as string;

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken);
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch);
      return;
    }

    resetPassword({ token, newPassword: password });
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">
          {localization.auth.resetPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.password}>
              <Label htmlFor="password">{localization.auth.password}</Label>

              <InputGroup>
                <InputGroupInput
                  aria-invalid={!!fieldErrors.password}
                  autoComplete="new-password"
                  disabled={isPending}
                  id="password"
                  maxLength={emailAndPassword?.maxPasswordLength}
                  minLength={emailAndPassword?.minPasswordLength}
                  name="password"
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();
                    const el = e.target as HTMLInputElement;
                    const min = emailAndPassword?.minPasswordLength;
                    const max = emailAndPassword?.maxPasswordLength;
                    const msg = el.validity.valueMissing
                      ? localization.auth.fieldRequired
                      : el.validity.tooShort
                        ? localization.auth.tooShort.replace(
                            "{{min}}",
                            String(min)
                          )
                        : localization.auth.tooLong.replace(
                            "{{max}}",
                            String(max)
                          );

                    setFieldErrors((prev) => ({
                      ...prev,
                      password: msg,
                    }));
                  }}
                  placeholder={localization.auth.newPasswordPlaceholder}
                  required
                  type={isPasswordVisible ? "text" : "password"}
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onClick={() => {
                      setIsPasswordVisible(!isPasswordVisible);
                    }}
                    title={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldError>{fieldErrors.password}</FieldError>
            </Field>

            {emailAndPassword?.confirmPassword && (
              <Field data-invalid={!!fieldErrors.confirmPassword}>
                <Label htmlFor="confirmPassword">
                  {localization.auth.confirmPassword}
                </Label>

                <InputGroup>
                  <InputGroupInput
                    aria-invalid={!!fieldErrors.confirmPassword}
                    autoComplete="new-password"
                    disabled={isPending}
                    id="confirmPassword"
                    maxLength={emailAndPassword?.maxPasswordLength}
                    minLength={emailAndPassword?.minPasswordLength}
                    name="confirmPassword"
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                    onInvalid={(e) => {
                      e.preventDefault();
                      const el = e.target as HTMLInputElement;
                      const min = emailAndPassword?.minPasswordLength;
                      const max = emailAndPassword?.maxPasswordLength;
                      const msg = el.validity.valueMissing
                        ? localization.auth.fieldRequired
                        : el.validity.tooShort
                          ? localization.auth.tooShort.replace(
                              "{{min}}",
                              String(min)
                            )
                          : localization.auth.tooLong.replace(
                              "{{max}}",
                              String(max)
                            );

                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: msg,
                      }));
                    }}
                    placeholder={localization.auth.confirmPasswordPlaceholder}
                    required
                    type={isConfirmPasswordVisible ? "text" : "password"}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onClick={() => {
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
                      }}
                      title={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                    >
                      {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            )}

            <div className="flex flex-col gap-3">
              <Button disabled={isPending} type="submit">
                {isPending && <Spinner />}

                {localization.auth.resetPassword}
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
