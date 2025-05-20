import React, { Suspense } from 'react';

import Loading from '@/app/(main)/playground/loading';
import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header';

import styles from './page.module.scss';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.mainLayout}>
      <header className={styles.header} style={{ flexShrink: 0 }}>
        <Header />
      </header>
      <Suspense fallback={<Loading />}>
        <main className={styles.main}>{children}</main>
      </Suspense>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}
