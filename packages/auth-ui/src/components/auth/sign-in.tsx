"use client";

import { authMutationKeys } from "@better-auth-ui/core";
import {
  useAuth,
  useFetchOptions,
  useSendVerificationEmail,
  useSignInEmail,
} from "@better-auth-ui/react";
import { useIsMutating } from "@tanstack/react-query";
import { useAuthRedirectTo } from "@workspace/auth-ui/hooks/use-auth-redirect-to";
import { Button } from "@workspace/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { Checkbox } from "@workspace/ui/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import { Label } from "@workspace/ui/components/ui/label";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { type ReactNode, type SyntheticEvent, useState } from "react";
import { ProviderButtons, type SocialLayout } from "./provider-buttons";

export type SignInVariant = "card" | "page";

export interface SignInProps {
  className?: string;
  description?: ReactNode;
  socialLayout?: SocialLayout;
  socialPosition?: "top" | "bottom";
  title?: ReactNode;
  variant?: SignInVariant;
}

const PAGE_PROVIDER_BUTTON_CLASS =
  "h-10 w-full rounded-md px-6 text-base sm:text-base";

function SignInPageLayout({
  children,
  className,
  description,
  footerLinks,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  footerLinks: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className={cn("w-full max-w-md space-y-8", className)}>
      <div className="text-center">
        <h1 className="font-medium text-3xl text-foreground tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>

      {footerLinks}
    </div>
  );
}

function SignInCardLayout({
  children,
  className,
  footerLinks,
  title,
}: {
  children: ReactNode;
  className?: string;
  footerLinks: ReactNode;
  title: ReactNode;
}) {
  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="font-semibold text-xl">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {children}
        {footerLinks}
      </CardContent>
    </Card>
  );
}

interface SignInEmailFormProps {
  Captcha?: ReactNode;
  emailAndPassword: NonNullable<ReturnType<typeof useAuth>["emailAndPassword"]>;
  fieldErrors: { email?: string; password?: string };
  isPending: boolean;
  localization: ReturnType<typeof useAuth>["localization"];
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  password: string;
  plugins: ReturnType<typeof useAuth>["plugins"];
  setFieldErrors: React.Dispatch<
    React.SetStateAction<{ email?: string; password?: string }>
  >;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  signInEmailPending: boolean;
}

function SignInEmailForm({
  Captcha,
  emailAndPassword,
  fieldErrors,
  isPending,
  localization,
  onSubmit,
  password,
  plugins,
  setFieldErrors,
  setPassword,
  signInEmailPending,
}: SignInEmailFormProps) {
  return (
    <form onSubmit={onSubmit}>
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

        <Field data-invalid={!!fieldErrors.password}>
          <Label htmlFor="password">{localization.auth.password}</Label>

          <Input
            aria-invalid={!!fieldErrors.password}
            autoComplete="current-password"
            disabled={isPending}
            id="password"
            maxLength={emailAndPassword.maxPasswordLength}
            minLength={emailAndPassword.minPasswordLength}
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
              const min = emailAndPassword.minPasswordLength;
              const max = emailAndPassword.maxPasswordLength;
              let msg = localization.auth.fieldRequired;

              if (!el.validity.valueMissing) {
                msg = el.validity.tooShort
                  ? localization.auth.tooShort.replace("{{min}}", String(min))
                  : localization.auth.tooLong.replace("{{max}}", String(max));
              }

              setFieldErrors((prev) => ({
                ...prev,
                password: msg,
              }));
            }}
            placeholder={localization.auth.passwordPlaceholder}
            required
            type="password"
            value={password}
          />

          <FieldError>{fieldErrors.password}</FieldError>
        </Field>

        {emailAndPassword.rememberMe ? (
          <Field className="my-1">
            <div className="flex items-center gap-3">
              <Checkbox
                disabled={isPending}
                id="rememberMe"
                name="rememberMe"
              />

              <Label
                className="cursor-pointer font-normal text-sm"
                htmlFor="rememberMe"
              >
                {localization.auth.rememberMe}
              </Label>
            </div>
          </Field>
        ) : null}

        {Captcha ? <div className="flex justify-center">{Captcha}</div> : null}

        <div className="flex flex-col gap-3">
          <Button disabled={isPending} type="submit">
            {signInEmailPending ? <Spinner /> : null}

            {localization.auth.signIn}
          </Button>

          {plugins.flatMap((plugin) =>
            (plugin.authButtons ?? []).map((AuthButton, index) => (
              <AuthButton
                key={`${plugin.id}-${index.toString()}`}
                view="signIn"
              />
            ))
          )}
        </div>
      </FieldGroup>
    </form>
  );
}

/**
 * Render the sign-in form UI with email/password, magic link, and social provider options.
 */
export function SignIn({
  className,
  description,
  socialLayout,
  socialPosition = "bottom",
  title,
  variant = "card",
}: SignInProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    plugins,
    socialProviders,
    viewPaths,
    navigate,
    Link,
  } = useAuth();
  const redirectTo = useAuthRedirectTo();

  const { fetchOptions, resetFetchOptions } = useFetchOptions();

  const [password, setPassword] = useState("");

  const { mutate: sendVerificationEmail } = useSendVerificationEmail(
    authClient,
    {
      onSuccess: () => toast.success(localization.auth.verificationEmailSent),
    }
  );

  const { mutate: signInEmail, isPending: signInEmailPending } = useSignInEmail(
    authClient,
    {
      onError: (error, { email }) => {
        setPassword("");

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          toast.error(error.error?.message || error.message, {
            action: {
              label: localization.auth.resend,
              onClick: () =>
                sendVerificationEmail({
                  email,
                  callbackURL: `${baseURL}${redirectTo}`,
                }),
            },
          });
        }

        resetFetchOptions();
      },
      onSuccess: () => navigate({ to: redirectTo }),
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

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    signInEmail({
      email,
      password,
      ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
      fetchOptions,
    });
  };

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0;

  const resolvedTitle = title ?? localization.auth.signIn;
  const isPageVariant = variant === "page";

  const providerButtons = socialProviders && socialProviders.length > 0 && (
    <ProviderButtons
      buttonClassName={isPageVariant ? PAGE_PROVIDER_BUTTON_CLASS : undefined}
      buttonVariant={isPageVariant ? "secondary" : undefined}
      showProviderLogo={isPageVariant}
      socialLayout={socialLayout}
    />
  );

  const socialTop = socialPosition === "top" && (
    <>
      {providerButtons}

      {showSeparator && (
        <FieldSeparator
          className={cn(
            "flex items-center text-xs",
            isPageVariant
              ? "*:data-[slot=field-separator-content]:bg-background"
              : "*:data-[slot=field-separator-content]:bg-card",
            socialPosition === "top" && "m-0"
          )}
        >
          {localization.auth.or}
        </FieldSeparator>
      )}
    </>
  );

  const socialBottom = socialPosition === "bottom" && (
    <>
      {showSeparator && (
        <FieldSeparator
          className={cn(
            "flex items-center text-xs",
            isPageVariant
              ? "*:data-[slot=field-separator-content]:bg-background"
              : "*:data-[slot=field-separator-content]:bg-card"
          )}
        >
          {localization.auth.or}
        </FieldSeparator>
      )}

      {providerButtons}
    </>
  );

  const emailForm = emailAndPassword?.enabled ? (
    <SignInEmailForm
      Captcha={Captcha}
      emailAndPassword={emailAndPassword}
      fieldErrors={fieldErrors}
      isPending={isPending}
      localization={localization}
      onSubmit={handleSubmit}
      password={password}
      plugins={plugins}
      setFieldErrors={setFieldErrors}
      setPassword={setPassword}
      signInEmailPending={signInEmailPending}
    />
  ) : null;

  const hasFooterLinks =
    emailAndPassword?.forgotPassword || emailAndPassword?.enabled;

  const footerLinks = hasFooterLinks ? (
    <div className="mt-4 flex w-full flex-col items-center gap-3">
      {emailAndPassword?.forgotPassword && (
        <Link
          className="self-center text-sm underline-offset-4 hover:underline"
          href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
        >
          {localization.auth.forgotPasswordLink}
        </Link>
      )}

      {emailAndPassword?.enabled && (
        <FieldDescription className="text-center">
          {localization.auth.needToCreateAnAccount}{" "}
          <Link
            className="underline underline-offset-4"
            href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
          >
            {localization.auth.signUp}
          </Link>
        </FieldDescription>
      )}
    </div>
  ) : null;

  const formBody = (
    <div className={cn("flex flex-col", isPageVariant ? "gap-0" : "gap-6")}>
      {socialTop}
      {emailForm}
      {socialBottom}
    </div>
  );

  if (isPageVariant) {
    return (
      <SignInPageLayout
        className={className}
        description={description}
        footerLinks={footerLinks}
        title={resolvedTitle}
      >
        {formBody}
      </SignInPageLayout>
    );
  }

  return (
    <SignInCardLayout
      className={className}
      footerLinks={footerLinks}
      title={resolvedTitle}
    >
      {formBody}
    </SignInCardLayout>
  );
}
