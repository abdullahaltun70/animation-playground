// components/ConfigLink.tsx
'use client';

import { useState } from 'react';

// import { useToast } from '@/components/ui/use-toast';

interface ConfigLinkProps {
	configId: string;
	className?: string;
}

export function ConfigLink({ configId, className }: ConfigLinkProps) {
	const [copied, setCopied] = useState(false);
	// const { toast } = useToast();

	const configUrl = `${window.location.origin}/configs/${configId}`;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(configUrl);
			setCopied(true);
			console.log('Link copied!', copied);
			// toast({
			// 	title: 'Link copied!',
			// 	description:
			// 		'The configuration link has been copied to your clipboard.',
			// });

			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error(err);
			// toast({
			// 	title: 'Failed to copy',
			// 	description: 'Please try copying the link manually.',
			// 	variant: 'destructive',
			// });
		}
	};

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<input
				type="text"
				value={configUrl}
				readOnly
				className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg"
			/>
			<button
				onClick={handleCopy}
				className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${
						copied
							? 'bg-green-500 text-white'
							: 'bg-blue-500 hover:bg-blue-600 text-white'
					}`}
			>
				{copied ? 'Copied!' : 'Copy Link'}
			</button>
		</div>
	);
}
