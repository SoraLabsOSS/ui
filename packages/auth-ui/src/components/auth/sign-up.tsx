"use client";

import { useIsMutating } from "@tanstack/react-query";
import {
  authMutationKeys,
  parseAdditionalFieldValue,
} from "@workspace/auth-ui/lib/auth-core";
import {
  useAuth,
  useFetchOptions,
  useSignUpEmail,
} from "@workspace/auth-ui/lib/auth-react";
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
  FieldSeparator,
} from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
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
import { type SyntheticEvent, useState } from "react";
import { AdditionalField } from "./additional-field";
import { ProviderButtons, type SocialLayout } from "./provider-buttons";

export interface SignUpProps {
  className?: string;
  socialLayout?: SocialLayout;
  socialPosition?: "top" | "bottom";
}

/**
 * Renders a sign-up form with name, email, and password fields, optional social provider buttons, and submission handling.
 *
 * Submits credentials to the configured auth client and handles the response:
 * - If email verification is required, shows a notification and navigates to sign-in
 * - On success, refreshes the session and navigates to the configured redirect path
 * - On failure, displays error toasts
 * - Manages a pending state while the request is in-flight
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param socialLayout - Social layout to apply to the component
 * @param socialPosition - Social position to apply to the component
 * @returns The sign-up form React element.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom",
}: SignUpProps) {
  const {
    additionalFields,
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    navigate,
    Link,
  } = useAuth();

  const { fetchOptions, resetFetchOptions } = useFetchOptions();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: signUpEmail, isPending: signUpEmailPending } = useSignUpEmail(
    authClient,
    {
      onError: () => {
        setPassword("");
        setConfirmPassword("");
        resetFetchOptions();
      },
      onSuccess: () => {
        if (emailAndPassword?.requireEmailVerification) {
          toast.success(localization.auth.verifyYourEmail);
          navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
        } else {
          navigate({ to: redirectTo });
        }
      },
    }
  );

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all,
  });
  const isPending = signInMutating + signUpMutating > 0;

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    // `emailAndPassword.name === false` hides the name field and submits "".
    const name = (formData.get("name") as string | null) ?? "";
    const email = formData.get("email") as string;

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    const additionalFieldValues: Record<string, unknown> = {};

    for (const field of additionalFields ?? []) {
      if (!field.signUp || field.readOnly) {
        continue;
      }
      const value = parseAdditionalFieldValue(
        field,
        formData.get(field.name) as string | null
      );

      if (field.validate) {
        try {
          await field.validate(value);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : String(error));
          return;
        }
      }

      if (value !== undefined) {
        additionalFieldValues[field.name] = value;
      }
    }

    signUpEmail({
      name,
      email,
      password,
      ...additionalFieldValues,
      fetchOptions,
    });
  };

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0;

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">
          {localization.auth.signUp}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} />
              )}

              {showSeparator && (
                <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-card">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          {emailAndPassword?.enabled && (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {emailAndPassword.name !== false && (
                  <Field data-invalid={!!fieldErrors.name}>
                    <Label htmlFor="name">{localization.auth.name}</Label>

                    <Input
                      aria-invalid={!!fieldErrors.name}
                      autoComplete="name"
                      disabled={isPending}
                      id="name"
                      name="name"
                      onChange={() => {
                        setFieldErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();

                        setFieldErrors((prev) => ({
                          ...prev,
                          name: localization.auth.fieldRequired,
                        }));
                      }}
                      placeholder={localization.auth.namePlaceholder}
                      required
                      type="text"
                    />

                    <FieldError>{fieldErrors.name}</FieldError>
                  </Field>
                )}

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

                {additionalFields?.map(
                  (field) =>
                    field.signUp === "above" && (
                      <AdditionalField
                        field={field}
                        isPending={isPending}
                        key={field.name}
                        name={field.name}
                      />
                    )
                )}

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
                      onChange={(e) => {
                        setPassword(e.target.value);
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
                      placeholder={localization.auth.passwordPlaceholder}
                      required
                      type={isPasswordVisible ? "text" : "password"}
                      value={password}
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
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);

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
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
                        required
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        value={confirmPassword}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            isConfirmPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          onClick={() =>
                            setIsConfirmPasswordVisible(
                              !isConfirmPasswordVisible
                            )
                          }
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

                {additionalFields?.map(
                  (field) =>
                    field.signUp &&
                    field.signUp !== "above" && (
                      <AdditionalField
                        field={field}
                        isPending={isPending}
                        key={field.name}
                        name={field.name}
                      />
                    )
                )}

                {Captcha && (
                  <div className="flex justify-center">{Captcha}</div>
                )}

                <div className="flex flex-col gap-3">
                  <Button disabled={isPending} type="submit">
                    {signUpEmailPending && <Spinner />}

                    {localization.auth.signUp}
                  </Button>

                  {plugins.flatMap((plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => (
                      <AuthButton
                        key={`${plugin.id}-${index.toString()}`}
                        view="signUp"
                      />
                    ))
                  )}
                </div>
              </FieldGroup>
            </form>
          )}

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-card">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} />
              )}
            </>
          )}
        </div>

        {emailAndPassword?.enabled && (
          <div className="mt-4 flex w-full flex-col items-center gap-3">
            <FieldDescription className="text-center">
              {localization.auth.alreadyHaveAnAccount}{" "}
              <Link
                className="underline underline-offset-4"
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              >
                {localization.auth.signIn}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
