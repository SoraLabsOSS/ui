import Link from "next/link";
import { COMMUNITY_ISSUES_URL } from "@/lib/site";

const LAST_UPDATED = "June 24, 2026";

export function TermsOfServiceArticle() {
  return (
    <>
      <h1 id="terms-of-service">Terms of Service</h1>
      <p>
        <small>
          <em>Last updated: {LAST_UPDATED}.</em>
        </small>
      </p>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Sora
        UI website, registry, documentation, and account features
        (&ldquo;Services&rdquo;). By using the Services, you agree to these
        Terms.
      </p>

      <h2 id="use-of-services">1. Use of the Services</h2>
      <p>
        Sora UI provides free UI components and documentation for developers.
        You may browse the site without an account. Some features, such as
        bookmarks, require signing in with Google or GitHub.
      </p>
      <p>You agree not to:</p>
      <ul>
        <li>
          Abuse, disrupt, or attempt to gain unauthorized access to the Services
        </li>
        <li>Use the Services in violation of applicable law</li>
        <li>Scrape or overload the site in ways that harm other users</li>
      </ul>

      <h2 id="accounts">2. Accounts</h2>
      <p>
        You are responsible for activity under your account. Keep your OAuth
        credentials secure with your identity provider. We may suspend or
        terminate accounts that violate these Terms or pose a security risk.
      </p>

      <h2 id="component-license">3. Component license</h2>
      <p>
        Use of Sora UI components in your own projects is governed by the{" "}
        <Link href="/docs/license">component license</Link>, not by these Terms
        alone. Please review that license before copying or distributing
        registry code.
      </p>

      <h2 id="disclaimer">4. Disclaimer</h2>
      <p>
        The Services are provided &ldquo;as is&rdquo; without warranties of any
        kind. We do not guarantee uninterrupted availability, error-free
        operation, or fitness for a particular purpose.
      </p>

      <h2 id="limitation">5. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Sora UI and its contributors
        will not be liable for indirect, incidental, or consequential damages
        arising from your use of the Services.
      </p>

      <h2 id="privacy">6. Privacy</h2>
      <p>
        Our collection and use of personal data is described in the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2 id="changes">7. Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Services after changes are posted constitutes acceptance of the updated
        Terms.
      </p>

      <h2 id="contact">8. Contact</h2>
      <p>
        Questions about these Terms?{" "}
        <a
          href={COMMUNITY_ISSUES_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open an issue
        </a>{" "}
        on GitHub.
      </p>
    </>
  );
}
