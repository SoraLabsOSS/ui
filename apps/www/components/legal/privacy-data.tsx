import Link from "next/link";
import {
  COMMUNITY_DISCUSSIONS_URL,
  COMMUNITY_ISSUES_URL,
  CONTACT_EMAIL,
} from "@/lib/site";
import type { TermItem } from "./legal-scroll-view";

export const PRIVACY_POLICY_ITEMS: TermItem[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p className="lg:text-lg">
          Sora UI (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is
          a free component registry and documentation platform.
        </p>
        <p className="lg:text-lg">
          This Privacy Policy explains how we collect, use, and protect
          information when you visit the site, sign in, save bookmarks, or
          utilize account features.
        </p>
        <p className="lg:text-lg">
          Component licensing is separate from this policy. See the{" "}
          <Link
            className="underline underline-offset-4 hover:opacity-80"
            href="/docs/license"
          >
            component license
          </Link>{" "}
          for terms on using Sora UI code in your personal or commercial
          projects.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <>
        <h4 className="font-medium text-foreground text-lg">
          1.1 Information you provide
        </h4>
        <p className="lg:text-lg">
          When you sign in or use account features, we may collect:
        </p>
        <ul className="list-disc space-y-2 pl-4 lg:text-lg">
          <li>
            Name, email address, and profile picture from Google or GitHub
          </li>
          <li>Bookmarked components and documentation pages</li>
          <li>Communications you send to us through GitHub or email</li>
        </ul>
        <p className="lg:text-lg">
          We never store your Google or GitHub password. Authentication is
          handled securely through OAuth; we receive only the profile fields
          needed to identify and maintain your account.
        </p>
        <h4 className="pt-2 font-medium text-foreground text-lg">
          1.2 Information collected automatically
        </h4>
        <p className="lg:text-lg">When you browse Sora UI, we may collect:</p>
        <ul className="list-disc space-y-2 pl-4 lg:text-lg">
          <li>Pages visited and component views through Vercel Analytics</li>
          <li>
            Error diagnostics such as browser, route, and stack traces when
            unexpected errors occur
          </li>
          <li>Session and verification data required for authentication</li>
          <li>
            IP address and device information for security and rate limiting
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Information",
    content: (
      <>
        <p className="lg:text-lg">We use collected information to:</p>
        <ul className="list-disc space-y-2 pl-4 lg:text-lg">
          <li>Create and manage your account</li>
          <li>Save your bookmarks across devices</li>
          <li>Improve components and documentation experience</li>
          <li>Monitor errors and protect against abuse</li>
          <li>Respond to support requests and inquiries</li>
        </ul>
        <p className="font-medium text-foreground lg:text-lg">
          We do not sell your personal data. We do not use account data for
          advertising profiling.
        </p>
      </>
    ),
  },
  {
    id: "services-we-use",
    title: "3. Services We Use",
    content: (
      <>
        <p className="lg:text-lg">
          Sora UI relies on the following infrastructure:
        </p>
        <ul className="list-disc space-y-2 pl-4 lg:text-lg">
          <li>
            <strong>Better Auth</strong> &mdash; authentication, sessions, and
            account management
          </li>
          <li>
            <strong>PostgreSQL</strong> &mdash; user profiles, sessions, and
            saved bookmarks
          </li>
          <li>
            <strong>Redis</strong> &mdash; temporary authentication and
            rate-limit cache
          </li>
          <li>
            <strong>Sentry</strong> &mdash; error monitoring and performance
            diagnostics
          </li>
          <li>
            <strong>Vercel Analytics</strong> &mdash; privacy-friendly
            aggregated usage statistics
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "error-monitoring",
    title: "4. Error Monitoring",
    content: (
      <>
        <p className="lg:text-lg">
          When we send diagnostics to Sentry, we aim to capture enough context
          to diagnose and fix bugs without exposing secrets.
        </p>
        <p className="lg:text-lg">
          We do not intentionally send session cookies, OAuth tokens, access
          tokens, or sensitive request bodies to Sentry.
        </p>
        <p className="lg:text-lg">
          If you believe an error report included something sensitive, please{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href={COMMUNITY_ISSUES_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            open an issue on GitHub
          </a>{" "}
          or email us so we can investigate and scrub it immediately.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: (
      <>
        <p className="lg:text-lg">
          We retain account and bookmark data while your account is active.
          Session and cache data in Redis expires automatically.
        </p>
        <p className="lg:text-lg">
          You may delete your account from settings at any time; your associated
          profile and bookmark data will be removed as part of that process.
        </p>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "6. Your Choices",
    content: (
      <>
        <p className="lg:text-lg">
          You can browse docs and components without signing in. Bookmarks and
          sync features require an authenticated session.
        </p>
        <p className="lg:text-lg">
          You may sign out at any time or delete your account permanently from
          the settings page.
        </p>
      </>
    ),
  },
  {
    id: "google-user-data",
    title: "7. Google User Data",
    content: (
      <>
        <p className="lg:text-lg">
          If you sign in with Google, we access your email, display name,
          profile picture, and unique Google account identifier.
        </p>
        <p className="lg:text-lg">
          We only request the minimum scopes needed for authentication. Google
          user data is used exclusively to identify and maintain your account
          and is never used for advertising or unrelated profiling.
        </p>
        <p className="lg:text-lg">
          You may revoke access at any time through your{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href="https://myaccount.google.com/permissions"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Account Permissions
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: (
      <>
        <p className="lg:text-lg">
          We may update this Privacy Policy from time to time. When we make
          changes, we will update the &ldquo;Last updated&rdquo; date at the top
          of this page.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "9. Contact Information",
    content: (
      <>
        <p className="lg:text-lg">
          Questions about this policy? Contact us at{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
          ,{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href={COMMUNITY_ISSUES_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            open an issue
          </a>
          , or join the{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href={COMMUNITY_DISCUSSIONS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            community discussion
          </a>
          .
        </p>
      </>
    ),
  },
];
