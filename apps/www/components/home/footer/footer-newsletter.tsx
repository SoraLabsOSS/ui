"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type FormEvent, useState } from "react";
import { SectionCtaScrambleButton } from "@/components/buttons/section-cta-scramble";
import { FooterArrowLink } from "./footer-arrow-link";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClassName = cn(
  "footer-newsletter-input",
  "min-w-0 flex-1 rounded-none bg-transparent px-0 pt-2 pb-4 text-foreground text-sm",
  "placeholder:text-muted-foreground/60",
  "border-foreground/20 border-b focus:border-foreground",
  "transition-colors duration-200 ease-out",
  "focus:outline-none disabled:opacity-50"
);

export function FooterNewsletter() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isEmailValid = EMAIL_PATTERN.test(email);
    setEmailError(!isEmailValid);
    setPolicyError(!policyAccepted);

    if (!(isEmailValid && policyAccepted)) {
      return;
    }

    setSubmitted(true);
  };

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-muted-foreground text-xs uppercase tracking-widest">
        <span className="text-foreground">Weekly drop</span>
        <span
          aria-hidden="true"
          className="inline-block size-2 bg-accent-pro"
        />
        <span>Join developers shipping with motion</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative flex flex-1 flex-col">
          <label className="sr-only" htmlFor="footer-newsletter-firstname">
            First name
          </label>
          <input
            autoComplete="given-name"
            className={inputClassName}
            // disabled={submitted}
            disabled
            id="footer-newsletter-firstname"
            onChange={(event) => {
              setFirstName(event.target.value);
            }}
            placeholder="First name"
            type="text"
            value={firstName}
          />
        </div>

        <div className="relative flex flex-1 flex-col">
          <label className="sr-only" htmlFor="footer-newsletter-email">
            Your email
          </label>
          <input
            aria-invalid={emailError}
            autoComplete="email"
            className={cn(
              inputClassName,
              emailError && "border-destructive focus:border-destructive"
            )}
            // disabled={submitted}
            disabled
            id="footer-newsletter-email"
            inputMode="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(false);
            }}
            placeholder="you@studio.com"
            type="email"
            value={email}
          />
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <label
            className="flex cursor-pointer items-center gap-3 font-mono text-muted-foreground text-xs uppercase tracking-widest"
            htmlFor="footer-newsletter-policy"
          >
            <input
              aria-invalid={policyError}
              checked={policyAccepted}
              className={cn(
                "size-4 cursor-pointer appearance-none border bg-transparent transition-colors",
                "checked:border-accent-pro checked:bg-accent-pro",
                "focus-visible:outline-2 focus-visible:outline-accent-pro focus-visible:outline-offset-2",
                "disabled:opacity-50",
                policyError ? "border-destructive" : "border-foreground/30"
              )}
              disabled={submitted}
              id="footer-newsletter-policy"
              onChange={(event) => {
                setPolicyAccepted(event.target.checked);
                setPolicyError(false);
              }}
              type="checkbox"
            />
            <span className="inline-flex flex-wrap items-center gap-x-1.5 normal-case tracking-normal">
              <span>I agree to the</span>
              <FooterArrowLink
                className="font-mono text-foreground text-xs uppercase tracking-widest"
                href="/docs/license"
                textClassName="normal-case tracking-normal"
              >
                license terms
              </FooterArrowLink>
            </span>
          </label>

          {submitted ? (
            <p className="font-mono text-accent-pro text-xs uppercase tracking-widest">
              You&apos;re on the list
            </p>
          ) : (
            <SectionCtaScrambleButton
              label="Join"
              type="submit"
              variant="accent"
            />
          )}
        </div>
      </div>
    </form>
  );
}
