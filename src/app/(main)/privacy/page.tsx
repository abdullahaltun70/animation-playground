import styles from './Privacy.module.scss';

export default function PrivacyPage() {
  return (
    <div className={styles.privacyContainer}>
      <h1>Privacy Policy</h1>
      <p className={styles.lastUpdated}>
        Last updated: {new Date().toDateString()}
      </p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Save animation configurations</li>
          <li>Share configurations with others</li>
          <li>Contact us for support</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide and maintain our services</li>
          <li>Save your animation configurations</li>
          <li>Enable sharing functionality</li>
          <li>Improve our services</li>
          <li>Send you important updates</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Storage</h2>
        <p>
          Your data is securely stored using Supabase and is protected by
          industry-standard security measures.
        </p>
      </section>

      <section>
        <h2>4. Cookies</h2>
        <p>
          We use cookies to maintain your authentication state and improve your
          experience. By using our service, you consent to our use of cookies.
        </p>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your configurations</li>
        </ul>
      </section>

      <section>
        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p>
          <a href="mailto:privacy@animationapp.com">privacy@animationapp.com</a>
        </p>
      </section>
    </div>
  );
}
