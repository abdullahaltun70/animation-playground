import React from 'react';

import { Button, Dialog, Flex } from '@radix-ui/themes';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirmLeave: () => void;
  onCancel: () => void;
}

/**
 * @component UnsavedChangesDialog
 * @description A dialog component to confirm user action when attempting to navigate away with unsaved changes.
 * @param {UnsavedChangesDialogProps} props - The props for the component.
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {(isOpen: boolean) => void} props.onOpenChange - Callback for dialog visibility changes.
 * @param {() => void} props.onConfirmLeave - Callback invoked when the user confirms leaving.
 * @param {() => void} props.onCancel - Callback invoked when the user cancels leaving.
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirmLeave,
  onCancel,
}: UnsavedChangesDialogProps) {
  const handleConfirm = () => {
    onConfirmLeave();
    onOpenChange(false); // Ensure dialog closes
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false); // Ensure dialog closes
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Unsaved Changes</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          You have unsaved changes. Are you sure you want to leave? Your changes
          will be lost.
        </Dialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={handleCancel}>
            Stay
          </Button>
          <Button variant="solid" onClick={handleConfirm}>
            Leave Page
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
