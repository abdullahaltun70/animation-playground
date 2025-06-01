import React from 'react';

import { Button } from '@radix-ui/themes';

import styles from '../styles/Playground.module.scss';

/**
 * @interface ErrorNotificationProps
 * @description Defines the props for the ErrorNotification component.
 * @property {string} message - The error message to display.
 * @property {() => void} onDismiss - Callback function invoked when the dismiss button is clicked.
 */
interface ErrorNotificationProps {
  message: string;
  onDismiss: () => void;
}

/**
 * @component ErrorNotification
 * @description A component that displays an error message with a dismiss button.
 * It is typically used to show feedback to the user when an error occurs.
 * @param {ErrorNotificationProps} props - The props for the component.
 */
export function ErrorNotification({
  message,
  onDismiss,
}: ErrorNotificationProps) {
  return (
    <div className={styles.errorMessage}>
      {message}
      <Button onClick={onDismiss}>Dismiss</Button>
    </div>
  );
}
