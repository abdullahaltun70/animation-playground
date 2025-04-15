'use client';

import { useState } from 'react';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Box, Flex, Card, Text, Button } from '@radix-ui/themes';

import { AnimationPreview } from '@/app/(main)/playground/components/AnimationPreview';
import { ErrorNotification } from '@/app/(main)/playground/components/ErrorNotification';
import { ExportDialog } from '@/app/(main)/playground/components/ExportDialog';
import { LoadingIndicator } from '@/app/(main)/playground/components/LoadingIndicator';
import { ShareDialog } from '@/app/(main)/playground/components/ShareDialog';
import { useAnimationConfig } from '@/app/(main)/playground/hooks/useAnimationConfig';
import { useShareExport } from '@/app/(main)/playground/hooks/useShareExport';
import { ConfigPanel } from '@/components/config-panel/ConfigPanel';

import styles from './styles/Playground.module.scss';

export default function PlaygroundPage() {
	// Use custom hooks to manage state
	const {
		animationConfig,
		setAnimationConfig,
		loading,
		error,
		setError,
		configId,
		isReadOnly,
		copyConfig,
		saveConfig,
		resetConfig,
	} = useAnimationConfig();

	const {
		shareDialogOpen,
		setShareDialogOpen,
		exportDialogOpen,
		setExportDialogOpen,
		shareUrl,
		copySuccess,
		exportTab,
		setExportTab,
		handleShare,
		handleExport,
		handleCopyUrl,
		handleCopyCode,
	} = useShareExport(configId);

	const [isCopying, setIsCopying] = useState(false);
	const [copyCompleted, setCopyCompleted] = useState(false);

	const handleCopyConfig = async () => {
		setIsCopying(true);
		try {
			const success = await copyConfig();
			if (success) {
				setCopyCompleted(true);
				setTimeout(() => setCopyCompleted(false), 3000);
			}
		} finally {
			setIsCopying(false);
		}
	};

	return (
		<div className={styles.pageContainer}>
			{error && (
				<ErrorNotification message={error} onDismiss={() => setError(null)} />
			)}

			{loading && <LoadingIndicator />}

			{/* Read only banner if the user is viewing someone else's configuration */}
			{isReadOnly && (
				<Card className={styles.readOnlyBanner}>
					<Flex align="center" gap="2">
						<InfoCircledIcon />
						<Text>
							You are viewing someone else&#39;s animation configuration. Make a
							copy to edit it.
						</Text>
						<Button
							onClick={handleCopyConfig}
							disabled={isCopying}
							className={styles.copyButton}
						>
							{isCopying ? 'Creating copy...' : 'Make a copy'}
						</Button>
					</Flex>
				</Card>
			)}

			{copyCompleted && (
				<Card className={styles.copySuccessCard}>
					<Text color="green">
						Configuration copied successfully! You can now edit it.
					</Text>
				</Card>
			)}

			<Flex className={styles.container}>
				{/* Left side - Animation Preview Area */}
				<AnimationPreview
					config={animationConfig}
					configId={configId}
					onShare={handleShare}
					onExport={handleExport}
				/>

				{/* Right side - Config Panel */}
				<Box className={styles.configAreaWrapper}>
					<ConfigPanel
						initialConfig={animationConfig}
						onConfigChange={isReadOnly ? undefined : setAnimationConfig}
						onSave={isReadOnly ? handleCopyConfig : saveConfig}
						onReset={resetConfig}
						isReadOnly={isReadOnly}
						saveButtonText={isReadOnly ? 'Save as my configuration' : 'Save'}
					/>
				</Box>
			</Flex>

			{/* Share Dialog */}
			<ShareDialog
				open={shareDialogOpen}
				onOpenChange={setShareDialogOpen}
				shareUrl={shareUrl}
				onCopyUrl={handleCopyUrl}
				copySuccess={copySuccess}
			/>

			{/* Export Dialog */}
			<ExportDialog
				open={exportDialogOpen}
				onOpenChange={setExportDialogOpen}
				exportTab={exportTab}
				onExportTabChange={setExportTab}
				onCopyCode={() => handleCopyCode(animationConfig)}
				copySuccess={copySuccess}
				animationConfig={animationConfig}
			/>
		</div>
	);
}
