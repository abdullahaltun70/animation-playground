import React from 'react';

import { CopyIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, Button, Box, Tabs, Text } from '@radix-ui/themes';

import { AnimationConfig } from '@/types/animations';
import { generateCSSCode, generateReactComponent } from '@/utils/animations';

import styles from '../styles/Playground.module.scss';

interface ExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	exportTab: string;
	onExportTabChange: (value: string) => void;
	onCopyCode: () => void;
	copySuccess: boolean;
	animationConfig: AnimationConfig;
}

export function ExportDialog({
	open,
	onOpenChange,
	exportTab,
	onExportTabChange,
	onCopyCode,
	copySuccess,
	animationConfig,
}: ExportDialogProps) {
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
								{generateReactComponent(animationConfig)}
							</pre>
						</Tabs.Content>

						<Tabs.Content value="css">
							<pre className={styles.codeBlock}>
								{generateCSSCode(animationConfig)}
							</pre>
						</Tabs.Content>
					</Box>
				</Tabs.Root>

				<Flex gap="3" mt="4" justify="end">
					<Button onClick={onCopyCode}>
						<CopyIcon /> Copy Code
					</Button>
					<Dialog.Close>
						<Button variant="soft">Close</Button>
					</Dialog.Close>
				</Flex>

				{copySuccess && (
					<Text color="green" mt="2">
						Code copied to clipboard!
					</Text>
				)}
			</Dialog.Content>
		</Dialog.Root>
	);
}
