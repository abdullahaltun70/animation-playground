import React from 'react';

import { Link as RadixLink, Text } from '@radix-ui/themes';

import styles from './Footer.module.scss';

/**
 * @component Footer
 * @description Renders the application footer, displaying copyright information and navigation links.
 * It does not accept any props.
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-cy="site-footer">
      <div className={styles.footerContent}>
        <Text size="2">© {currentYear} Animation Playground</Text>

        <div className={styles.footerLinks}>
          <RadixLink href="/terms" size={'2'} data-cy="footer-terms">
            Terms
          </RadixLink>
          <RadixLink href="/privacy" size={'2'} data-cy="footer-privacy">
            Privacy
          </RadixLink>
          <RadixLink
            href="https://github.com/abdullahaltun70/animation-playground"
            size="2"
            target="_blank"
            rel="noopener noreferrer"
            data-cy="footer-github"
          >
            GitHub
          </RadixLink>
        </div>
      </div>
    </footer>
  );
};
