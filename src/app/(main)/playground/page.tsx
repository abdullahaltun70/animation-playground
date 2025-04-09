'use client';

import React from 'react';

import { Box, Flex } from '@radix-ui/themes';

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

	return (
		// <Suspense fallback={<Loading />}>
		<div className={styles.pageContainer}>
			{error && (
				<ErrorNotification message={error} onDismiss={() => setError(null)} />
			)}

			{loading && <LoadingIndicator />}

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
						onConfigChange={setAnimationConfig}
						onSave={saveConfig}
						onReset={resetConfig}
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
		// </Suspense>
	);
}
