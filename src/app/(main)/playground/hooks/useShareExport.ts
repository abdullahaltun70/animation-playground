import { useState } from 'react';

import { AnimationConfig } from '@/types/animations';
import { generateCSSCode, generateReactComponent } from '@/utils/animations';

export function useShareExport(configId: string | null) {
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState('');
	const [copySuccess, setCopySuccess] = useState(false);
	const [exportTab, setExportTab] = useState('react');
	const [error, setError] = useState<string | null>(null);

	const handleShare = () => {
		if (!configId) {
			setError('Please save your configuration before sharing');
			return;
		}

		// Generate shareable URL
		const url = new URL(window.location.href);
		setShareUrl(url.toString());
		setShareDialogOpen(true);
	};

	const handleExport = () => {
		setExportDialogOpen(true);
	};

	const handleCopyUrl = () => {
		navigator.clipboard
			.writeText(shareUrl)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => setCopySuccess(false), 2000);
			})
			.catch((err) => {
				console.error('Failed to copy URL:', err);
				setError('Failed to copy URL to clipboard');
			});
	};

	const handleCopyCode = (animationConfig: AnimationConfig) => {
		const code =
			exportTab === 'react'
				? generateReactComponent(animationConfig)
				: generateCSSCode(animationConfig);

		navigator.clipboard
			.writeText(code)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => setCopySuccess(false), 2000);
			})
			.catch((err) => {
				console.error('Failed to copy code:', err);
				setError('Failed to copy code to clipboard');
			});
	};

	return {
		shareDialogOpen,
		setShareDialogOpen,
		exportDialogOpen,
		setExportDialogOpen,
		shareUrl,
		copySuccess,
		exportTab,
		setExportTab,
		error,
		setError,
		handleShare,
		handleExport,
		handleCopyUrl,
		handleCopyCode,
	};
}
