import React from 'react';

import { CopyIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  Flex,
  Button,
  TextField,
  IconButton,
  Text,
} from '@radix-ui/themes';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  onCopyUrl: () => void;
  copySuccess: boolean;
}

/**
 * @component ShareDialog
 * @description A dialog component that displays a shareable URL for the current
 * animation configuration and allows the user to copy it to the clipboard.
 * @param {ShareDialogProps} props - The props for the component.
 */
export function ShareDialog({
  open,
  onOpenChange,
  shareUrl,
  onCopyUrl,
  copySuccess,
}: ShareDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Share Animation Configuration</Dialog.Title>
        <Dialog.Description>
          Anyone with this link can view and edit this animation configuration.
        </Dialog.Description>

        <Flex gap="3" mt="4">
          <TextField.Root
            value={shareUrl || ''}
            readOnly
            style={{ flexGrow: 1 }}
            aria-label="Share URL"
          />
          <IconButton onClick={onCopyUrl} aria-label="Copy URL">
            <CopyIcon />
          </IconButton>
        </Flex>

        {copySuccess && (
          <Text mt="2" className="text-green-600">
            URL copied to clipboard!
          </Text>
        )}

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft">Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
