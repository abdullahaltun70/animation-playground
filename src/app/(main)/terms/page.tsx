import styles from './Terms.module.scss';

/**
 * Renders the Terms of Service page.
 * Displays information regarding acceptance of terms, service description, user accounts,
 * acceptable use, intellectual property, termination, changes to terms, and contact details.
 * The "Last updated" date is dynamically generated based on the current date.
 */
export default function TermsPage() {
  return (
    <div className={styles.termsContainer}>
      <h1>Terms of Service</h1>
      <p className={styles.lastUpdated}>
        Last updated: {new Date().toDateString()}
      </p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Animation Playground, you agree to be bound by
          these Terms of Service.
        </p>
      </section>

      <section>
        <h2>2. Service Description</h2>
        <p>
          Animation Playground provides tools for creating, testing, and sharing
          web animations. The service includes:
        </p>
        <ul>
          <li>Animation creation and preview tools</li>
          <li>Configuration saving and sharing</li>
          <li>Code generation features</li>
          <li>Community sharing capabilities</li>
        </ul>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <p>
          To access certain features, you must create an account. You are
          responsible for:
        </p>
        <ul>
          <li>Maintaining account security</li>
          <li>All activities under your account</li>
          <li>Keeping your credentials confidential</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for illegal purposes</li>
          <li>Share inappropriate or harmful content</li>
          <li>Attempt to breach security measures</li>
          <li>Infringe on intellectual property rights</li>
        </ul>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>
          The service and its original content are protected by copyright and
          other intellectual property rights.
        </p>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to our service
          immediately, without prior notice, for any breach of these Terms.
        </p>
      </section>

      <section>
        <h2>7. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify
          users of any material changes.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>For questions about these Terms, please contact us at:</p>
        <p>
          <a href="mailto:terms@animationapp.com">terms@animationapp.com</a>
        </p>
      </section>
    </div>
  );
}
