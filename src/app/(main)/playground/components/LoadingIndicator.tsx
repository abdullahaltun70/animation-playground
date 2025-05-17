import React from 'react';

import styles from '../styles/Playground.module.scss';

interface LoadingIndicatorProps {
  message?: string;
}

/**
 * Displays a loading indicator with an optional message.
 */
export function LoadingIndicator({
  message = 'Loading...',
}: LoadingIndicatorProps) {
  return <div className={styles.loadingIndicator}>{message}</div>;
}
