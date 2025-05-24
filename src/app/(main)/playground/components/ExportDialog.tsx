import React from 'react';

import { CopyIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, Button, Box, Tabs, Text } from '@radix-ui/themes';

import {
  generateCSSCode,
  generateReactComponent,
} from '@/app/utils/animations';
import { AnimationConfig } from '@/types/animations';

import styles from '../styles/Playground.module.scss';

/**
 * @interface ExportDialogProps
 * @description Defines the props for the ExportDialog component.
 * @property {boolean} open - Controls the visibility of the dialog.
 * @property {(open: boolean) => void} onOpenChange - Callback function invoked when the dialog's open state changes.
 * @property {string} exportTab - The currently active tab in the export dialog (e.g., 'react', 'css').
 * @property {(value: string) => void} onExportTabChange - Callback function invoked when the active export tab changes.
 * @property {(code: string) => void} onCopyCode - Callback function invoked when the "Copy Code" button is clicked.
 * @property {boolean} copySuccess - Boolean indicating if the code copy operation was successful.
 * @property {AnimationConfig} animationConfig - The current animation configuration to generate code from.
 */
interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportTab: string;
  onExportTabChange: (value: string) => void;
  onCopyCode: (code: string) => void;
  copySuccess: boolean;
  animationConfig: AnimationConfig;
}

/**
 * @component ExportDialog
 * @description A dialog component that allows users to export the current animation
 * configuration as either React component code or CSS. It provides tabs for switching
 * between code formats and a button to copy the generated code.
 * @param {ExportDialogProps} props - The props for the component.
 */
export function ExportDialog({
  open,
  onOpenChange,
  exportTab,
  onExportTabChange,
  onCopyCode,
  copySuccess,
  animationConfig,
}: ExportDialogProps) {
  // Generate code with error handling
  const getGeneratedCode = (tab: string): string => {
    try {
      if (tab === 'react') {
        return generateReactComponent(animationConfig);
      } else {
        return generateCSSCode(animationConfig);
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      return `// Error generating ${tab} code`;
    }
  };

  const currentCode = getGeneratedCode(exportTab);

  const handleCopyCode = () => {
    onCopyCode(currentCode);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Export Animation Code</Dialog.Title>
        <Dialog.Description>
          Copy the generated code to use this animation in your project.
        </Dialog.Description>

        <Tabs.Root
          defaultValue="react"
          value={exportTab}
          onValueChange={onExportTabChange}
        >
          <Tabs.List>
            <Tabs.Trigger value="react">React Component</Tabs.Trigger>
            <Tabs.Trigger value="css">CSS</Tabs.Trigger>
          </Tabs.List>
          <Box pt="3">
            <Tabs.Content value="react">
              <pre className={styles.codeBlock}>
                {exportTab === 'react' ? currentCode : ''}
              </pre>
            </Tabs.Content>
            <Tabs.Content value="css">
              <pre className={styles.codeBlock}>
                {exportTab === 'css' ? currentCode : ''}
              </pre>
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        <Flex gap="3" mt="4" justify="end">
          <Button onClick={handleCopyCode}>
            <CopyIcon /> Copy Code
          </Button>
          <Dialog.Close>
            <Button variant="soft">Close</Button>
          </Dialog.Close>
        </Flex>

        {copySuccess && (
          <Text mt="2" className="text-green-600">
            Code copied to clipboard!
          </Text>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
