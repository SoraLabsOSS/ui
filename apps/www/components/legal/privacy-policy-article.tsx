import Link from "next/link";
import { COMMUNITY_DISCUSSIONS_URL, COMMUNITY_ISSUES_URL } from "@/lib/site";

const LAST_UPDATED = "June 24, 2026";

export function PrivacyPolicyArticle() {
  return (
    <>
      <h1 id="privacy-policy">Privacy Policy</h1>
      <p>
        <small>
          <em>Last updated: {LAST_UPDATED}.</em>
        </small>
      </p>
      <p>
        Sora UI (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a
        free component registry and documentation site. This Privacy Policy
        explains how we collect, use, and protect information when you visit the
        site, sign in, save bookmarks, or use account features.
      </p>
      <p>
        Component licensing is separate from this policy. See the{" "}
        <Link href="/docs/license">component license</Link> for terms on using
        Sora UI code in your projects.
      </p>

      <h2 id="information-we-collect">1. Information we collect</h2>
      <h3 id="information-you-provide">1.1 Information you provide</h3>
      <p>When you sign in or use account features, we may collect:</p>
      <ul>
        <li>Name, email address, and profile picture from Google or GitHub</li>
        <li>Bookmarked components and documentation pages</li>
        <li>Communications you send to us through GitHub</li>
      </ul>
      <p>
        We never store your Google or GitHub password. Authentication is handled
        through OAuth; we receive only the profile fields needed to create and
        maintain your account.
      </p>

      <h3 id="information-collected-automatically">
        1.2 Information collected automatically
      </h3>
      <p>When you browse Sora UI, we may collect:</p>
      <ul>
        <li>Pages visited and component views through Vercel Analytics</li>
        <li>
          Error diagnostics such as browser, route, and stack traces when
          something fails
        </li>
        <li>Session and verification data required for authentication</li>
        <li>
          IP address and device information for security and rate limiting
        </li>
      </ul>

      <h2 id="how-we-use-information">2. How we use information</h2>
      <p>We use collected information to:</p>
      <ul>
        <li>Create and manage your account</li>
        <li>Save your bookmarks across devices</li>
        <li>Improve components and documentation experience</li>
        <li>Monitor errors and protect against abuse</li>
        <li>Respond to support requests on GitHub</li>
      </ul>
      <p>We do not sell your data.</p>
      <p>We do not use account data for advertising profiling.</p>

      <h2 id="services-we-use">3. Services we use</h2>
      <p>Sora UI relies on the following infrastructure:</p>
      <ul>
        <li>
          <strong>Better Auth</strong> — authentication, sessions, and account
          management
        </li>
        <li>
          <strong>PostgreSQL</strong> — user profiles, sessions, and saved
          bookmarks
        </li>
        <li>
          <strong>Redis</strong> — temporary auth and rate-limit cache
        </li>
        <li>
          <strong>Sentry</strong> — error monitoring and performance diagnostics
        </li>
        <li>
          <strong>Vercel Analytics</strong> — aggregated page and component
          usage
        </li>
      </ul>

      <h2 id="error-monitoring">4. Error monitoring</h2>
      <p>
        When we send diagnostics to Sentry, we aim to capture enough context to
        fix bugs without exposing secrets. We do not intentionally send session
        cookies, OAuth tokens, access tokens, or sensitive request bodies to
        Sentry.
      </p>
      <p>
        If you believe an error report included something it should not have,
        open an issue on{" "}
        <a
          href={COMMUNITY_ISSUES_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub
        </a>{" "}
        and we will investigate.
      </p>

      <h2 id="data-retention">5. Data retention</h2>
      <p>
        We retain account and bookmark data while your account is active.
        Session and cache data in Redis expires automatically. You may delete
        your account from settings; associated profile and bookmark data will be
        removed as part of that process.
      </p>

      <h2 id="your-choices">6. Your choices</h2>
      <p>
        You can browse docs and components without signing in. Bookmarks and
        account features require an authenticated session. You may sign out at
        any time or delete your account from settings.
      </p>

      <h2 id="google-user-data">7. Google user data</h2>
      <p>
        If you sign in with Google, we access your email, display name, profile
        picture, and unique Google account identifier. We only request the
        minimum scopes needed for authentication. Google user data is used
        exclusively to create and maintain your account and is not used for
        advertising or unrelated analytics.
      </p>
      <p>
        You may revoke access at any time through your{" "}
        <a
          href="https://myaccount.google.com/permissions"
          rel="noopener noreferrer"
          target="_blank"
        >
          Google Account Permissions
        </a>
        .
      </p>

      <h2 id="changes">8. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the
        updated version with a revised &ldquo;Last updated&rdquo; date.
      </p>

      <h2 id="contact">9. Contact</h2>
      <p>
        Questions about this policy?{" "}
        <a
          href={COMMUNITY_ISSUES_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open an issue
        </a>{" "}
        or join the{" "}
        <a
          href={COMMUNITY_DISCUSSIONS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          community discussion
        </a>
        .
      </p>
    </>
  );
}
