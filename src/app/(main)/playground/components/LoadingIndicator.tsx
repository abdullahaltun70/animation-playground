import React from 'react';

import styles from '../styles/Playground.module.scss';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className={styles.loadingIndicator}>{message}</div>
  );
}