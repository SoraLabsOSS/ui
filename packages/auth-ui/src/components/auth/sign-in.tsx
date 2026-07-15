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
import { Eye, EyeOff } from "lucide-react";
import {
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";
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
  "relative h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-4 font-medium text-black text-sm shadow-none transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";
const PAGE_PROVIDER_CONTAINER_CLASS =
  "grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4";
const PAGE_DIVIDER_LINE_CLASS = "h-px flex-1 bg-black/10 dark:bg-white/10";

function resolveSocialLayout(
  socialLayout: SocialLayout | undefined,
  isPageVariant: boolean
): SocialLayout | undefined {
  return socialLayout ?? (isPageVariant ? "grid" : undefined);
}

function SignInSeparator({
  extraClassName,
  isPageVariant,
  orText,
}: {
  extraClassName?: string;
  isPageVariant: boolean;
  orText: ReactNode;
}) {
  if (isPageVariant) {
    return (
      <div className="my-6 flex items-center gap-4 font-medium text-black/40 text-xs dark:text-white/30">
        <div className={PAGE_DIVIDER_LINE_CLASS} />
        {orText}
        <div className={PAGE_DIVIDER_LINE_CLASS} />
      </div>
    );
  }

  return (
    <FieldSeparator
      className={cn(
        "flex items-center text-xs",
        "*:data-[slot=field-separator-content]:bg-card",
        extraClassName
      )}
    >
      {orText}
    </FieldSeparator>
  );
}

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
    <div className={cn("w-full", className)}>
      <div>
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
 * Email/password fields styled 1:1 after the Sora Studio sign-up form
 * (hardcoded black/white surface, boxed inputs, blue glow submit button)
 * instead of the shared card-variant field styling.
 */
function SignInEmailFormPage({
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
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const labelClass = "font-semibold text-black/60 text-xs dark:text-white/60";
  const inputBoxClass =
    "relative flex h-11 items-center rounded-lg border border-black/15 bg-black/[0.02] px-3.5 dark:border-white/10 dark:bg-white/[0.03]";
  const inputClass =
    "w-full bg-transparent text-black text-sm outline-none placeholder:text-black/30 disabled:text-black/50 dark:text-white dark:disabled:text-white/50 dark:placeholder:text-white/30";

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div
        className="w-full space-y-1.5 text-left"
        data-invalid={!!fieldErrors.email}
      >
        <Label className={labelClass} htmlFor="email">
          {localization.auth.email}
        </Label>

        <div className={inputBoxClass}>
          <Input
            aria-invalid={!!fieldErrors.email}
            autoComplete="email"
            className={cn(
              inputClass,
              "h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            )}
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
        </div>

        <FieldError>{fieldErrors.email}</FieldError>
      </div>

      <div
        className="w-full space-y-1.5 text-left"
        data-invalid={!!fieldErrors.password}
      >
        <Label className={labelClass} htmlFor="password">
          {localization.auth.password}
        </Label>

        <div className={inputBoxClass}>
          <Input
            aria-invalid={!!fieldErrors.password}
            autoComplete="current-password"
            className={cn(
              inputClass,
              "h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            )}
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
            type={showPassword ? "text" : "password"}
            value={password}
          />

          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="cursor-pointer text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
            onClick={toggleShowPassword}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <FieldError>{fieldErrors.password}</FieldError>
      </div>

      {emailAndPassword.rememberMe ? (
        <div className="flex items-center gap-3">
          <Checkbox disabled={isPending} id="rememberMe" name="rememberMe" />

          <Label
            className="cursor-pointer font-normal text-black/60 text-sm dark:text-white/60"
            htmlFor="rememberMe"
          >
            {localization.auth.rememberMe}
          </Label>
        </div>
      ) : null}

      {Captcha ? <div className="flex justify-center">{Captcha}</div> : null}

      <button
        className="mt-8 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--color-primary)/40 bg-(--color-primary) font-medium text-sm text-white shadow-(--color-primary)/30 shadow-lg transition-opacity [--color-primary:#003AF9] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {signInEmailPending ? <Spinner /> : null}
        {localization.auth.signIn}
      </button>

      {plugins.flatMap((plugin) =>
        (plugin.authButtons ?? []).map((AuthButton, index) => (
          <AuthButton key={`${plugin.id}-${index.toString()}`} view="signIn" />
        ))
      )}
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
      containerClassName={
        isPageVariant ? PAGE_PROVIDER_CONTAINER_CLASS : undefined
      }
      display={isPageVariant ? "full" : undefined}
      showLastUsedBadge={isPageVariant}
      showProviderLogo={isPageVariant}
      socialLayout={resolveSocialLayout(socialLayout, isPageVariant)}
    />
  );

  const socialTop = socialPosition === "top" && (
    <>
      {providerButtons}

      {showSeparator && (
        <SignInSeparator
          extraClassName="m-0"
          isPageVariant={isPageVariant}
          orText={localization.auth.or}
        />
      )}
    </>
  );

  const socialBottom = socialPosition === "bottom" && (
    <>
      {showSeparator && (
        <SignInSeparator
          isPageVariant={isPageVariant}
          orText={localization.auth.or}
        />
      )}

      {providerButtons}
    </>
  );

  const EmailForm = isPageVariant ? SignInEmailFormPage : SignInEmailForm;

  const emailForm = emailAndPassword?.enabled ? (
    <EmailForm
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
