import React from 'react';

import { Link as RadixLink, Text } from '@radix-ui/themes';

import styles from './Footer.module.scss';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Copyright */}
        <Text size="2">© {currentYear} Animation Playground</Text>

        {/* Links */}
        <div className={styles.footerLinks}>
          <RadixLink href="/terms" size={'2'}>
            Terms
          </RadixLink>
          <RadixLink href="/privacy" size={'2'}>
            Privacy
          </RadixLink>
          <RadixLink
            href="https://github.com/abdullahaltun70/animation-playground"
            size="2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </RadixLink>
        </div>
      </div>
    </footer>
  );
};
