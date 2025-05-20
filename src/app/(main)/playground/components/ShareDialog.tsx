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
 * Dialog for sharing the animation configuration URL.
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
          <TextField.Root value={shareUrl} readOnly style={{ flexGrow: 1 }} />
          <IconButton onClick={onCopyUrl} aria-label="Copy URL">
            <CopyIcon />
          </IconButton>
        </Flex>

        {copySuccess && (
          <Text color="green" mt="2">
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
