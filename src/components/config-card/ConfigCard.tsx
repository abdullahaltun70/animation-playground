'use client';

import React from 'react';

import { Box, Flex, Text } from '@radix-ui/themes';

import { ConfigModel } from '@/types/animations';

import styles from './ConfigCard.module.scss';

interface ConfigCardProps {
	config: ConfigModel;
	onDeleteAction?: (id: string) => void;
	onShareAction?: (id: string) => void;
	setShowDeleteConfirm?: (value: boolean) => void;
	authorName: string;
}

export function ConfigCard({
	config,
	onDeleteAction,
	onShareAction,
	setShowDeleteConfirm,
	authorName,
}: ConfigCardProps) {
	const handleDelete = () => {
		if (onDeleteAction) {
			onDeleteAction(config.id);
			setShowDeleteConfirm?.(true);
		}
	};

	const handleShare = () => {
		if (onShareAction) {
			onShareAction(config.id);
		}
	};

	const handleEdit = () => {
		window.location.href = `/playground?id=${config.id}`;
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toISOString().split('T')[0];
	};

	return (
		<Box
			className={styles.configCard}
			p="4"
			style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}
		>
			<Flex direction="column" gap="2">
				<Text size="5" weight="bold">
					{config.title}
				</Text>
				<Text className={styles.description}>
					{config.description || 'No description provided'}
				</Text>
				<Text className={styles.description}>
					{formatDate(config.createdAt)}
				</Text>
				<Text className={styles.description}>@{authorName}</Text>

				<Flex mt="3" gap="2" justify="end">
					<button
						onClick={handleDelete}
						style={{
							background: 'none',
							backgroundColor: 'red',
							border: 'none',
							color: 'var(--text-primary)',
							cursor: 'pointer',
							padding: '4px 8px',
							borderRadius: '4px',
						}}
					>
						Delete
					</button>
					<button
						onClick={handleShare}
						style={{
							background: 'none',
							border: '1px solid var(--border-color)',
							color: 'var(--text-primary)',
							cursor: 'pointer',
							padding: '4px 8px',
							borderRadius: '4px',
						}}
					>
						Share
					</button>
					<button
						onClick={handleEdit}
						style={{
							background: 'var(--primary-color)',
							border: 'none',
							color: 'white',
							cursor: 'pointer',
							padding: '4px 8px',
							borderRadius: '4px',
						}}
					>
						Edit
					</button>
				</Flex>
			</Flex>
		</Box>
	);
}
