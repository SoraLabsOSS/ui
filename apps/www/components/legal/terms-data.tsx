import Link from "next/link";
import { COMMUNITY_ISSUES_URL, CONTACT_EMAIL } from "@/lib/site";
import type { TermItem } from "./legal-scroll-view";

export const TERMS_OF_SERVICE_ITEMS: TermItem[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: (
      <>
        <p className="lg:text-lg">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
          Sora UI website, registry, documentation, and account features
          (&ldquo;Services&rdquo;). By using the Services, you agree to these
          Terms.
        </p>
        <p className="lg:text-lg">
          If you do not agree with any part of these Terms, please do not access
          or use the Services.
        </p>
      </>
    ),
  },
  {
    id: "use-of-services",
    title: "1. Use of the Services",
    content: (
      <>
        <p className="lg:text-lg">
          Sora UI provides free UI components and documentation for developers.
          You may browse the site without an account. Some features, such as
          bookmarks, require signing in with Google or GitHub.
        </p>
        <p className="lg:text-lg">You agree not to:</p>
        <ul className="list-disc space-y-2 pl-4 lg:text-lg">
          <li>
            Abuse, disrupt, or attempt to gain unauthorized access to the
            Services
          </li>
          <li>Use the Services in violation of applicable law</li>
          <li>
            Scrape, crawl, or systematically overload the site in ways that harm
            other users or infrastructure
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "accounts",
    title: "2. Accounts",
    content: (
      <>
        <p className="lg:text-lg">
          You are responsible for activity under your account. Keep your OAuth
          credentials secure with your identity provider.
        </p>
        <p className="lg:text-lg">
          We may suspend or terminate accounts that violate these Terms or pose
          a security risk to the community or our services.
        </p>
      </>
    ),
  },
  {
    id: "component-license",
    title: "3. Component License",
    content: (
      <>
        <p className="lg:text-lg">
          Use of Sora UI components in your own projects is governed by the{" "}
          <Link
            className="underline underline-offset-4 hover:opacity-80"
            href="/docs/license"
          >
            component license
          </Link>
          , not by these Terms alone.
        </p>
        <p className="lg:text-lg">
          Please review the license terms before copying, modifying, or
          distributing registry component code.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "4. Disclaimer",
    content: (
      <>
        <p className="lg:text-lg">
          The Services are provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; without warranties of any kind, whether express or
          implied.
        </p>
        <p className="lg:text-lg">
          We do not guarantee uninterrupted availability, error-free operation,
          or fitness for a particular purpose.
        </p>
      </>
    ),
  },
  {
    id: "limitation",
    title: "5. Limitation of Liability",
    content: (
      <>
        <p className="lg:text-lg">
          To the fullest extent permitted by applicable law, Sora UI and its
          contributors will not be liable for any indirect, incidental, special,
          or consequential damages arising out of or in connection with your use
          of the Services.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "6. Privacy",
    content: (
      <>
        <p className="lg:text-lg">
          Our collection and use of personal data is described in our{" "}
          <Link
            className="underline underline-offset-4 hover:opacity-80"
            href="/legal/privacy"
          >
            Privacy Policy
          </Link>
          . By using our Services, you also consent to our data practices.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "7. Changes to Terms",
    content: (
      <>
        <p className="lg:text-lg">
          We may update these Terms from time to time to reflect changes in our
          services or legal requirements.
        </p>
        <p className="lg:text-lg">
          Continued use of the Services after changes are posted constitutes
          your binding acceptance of the updated Terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "8. Contact Information",
    content: (
      <>
        <p className="lg:text-lg">
          Questions about these Terms? Reach out to us at{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or{" "}
          <a
            className="underline underline-offset-4 hover:opacity-80"
            href={COMMUNITY_ISSUES_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            open an issue
          </a>{" "}
          on GitHub.
        </p>
      </>
    ),
  },
];
