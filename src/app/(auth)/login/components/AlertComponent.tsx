import React from 'react';

import { Button, Dialog, Flex } from '@radix-ui/themes';

interface AlertNotificationProps {
  showAlert: boolean;
  setShowAlert: (value: boolean) => void;
  alertTitle: string;
  alertMessage: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({
  showAlert,
  setShowAlert,
  alertTitle,
  alertMessage,
  onConfirm,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}) => (
  <Dialog.Root open={showAlert} onOpenChange={setShowAlert}>
    <Dialog.Content style={{ maxWidth: 450 }}>
      {' '}
      <Dialog.Title>{alertTitle}</Dialog.Title>
      <Dialog.Description size="2">{alertMessage}</Dialog.Description>
      <Flex gap="3" mt="4" justify="end">
        {/* Cancel Button */}
        <Dialog.Close>
          <Button
            variant="soft"
            color="gray"
            onClick={() => setShowAlert(false)}
          >
            {cancelButtonText}
          </Button>
        </Dialog.Close>
        {/* Confirm Button */}
        <Dialog.Close>
          <Button
            variant="solid"
            color="red"
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmButtonText}
          </Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
);

export default AlertNotification;
