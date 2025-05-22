import React from 'react';

import styles from '../styles/Playground.module.scss';

/**
 * @interface LoadingIndicatorProps
 * @description Defines the props for the LoadingIndicator component.
 * @property {string} [message='Loading...'] - Optional message to display alongside the loading indicator.
 */
interface LoadingIndicatorProps {
  message?: string;
}

/**
 * @component LoadingIndicator
 * @description A simple component that displays a loading message.
 * It is typically used to indicate that an operation is in progress.
 * @param {LoadingIndicatorProps} props - The props for the component.
 */
export function LoadingIndicator({
  message = 'Loading...',
}: LoadingIndicatorProps) {
  return <div className={styles.loadingIndicator}>{message}</div>;
}
