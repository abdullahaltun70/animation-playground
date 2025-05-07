import React from 'react';

import { Button } from '@radix-ui/themes';

import styles from '../styles/Playground.module.scss';

interface ErrorNotificationProps {
  message: string;
  onDismiss: () => void;
}

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
