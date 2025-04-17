'use client';

import React from 'react';

import {
	CalendarIcon,
	PersonIcon,
	EyeOpenIcon,
	LockClosedIcon,
	TrashIcon,
	Share1Icon,
	Pencil2Icon,
} from '@radix-ui/react-icons';
import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

import { ConfigModel } from '@/types/animations';

import styles from './ConfigCard.module.scss';

interface ConfigCardProps {
	config: ConfigModel;
	onDeleteAction?: (id: string) => void;
	onShareAction?: (id: string) => void;
	authorName: string;
}

export function ConfigCard({
	config,
	onDeleteAction,
	onShareAction,
	authorName,
}: ConfigCardProps) {
	const router = useRouter();
	const handleShare = () => {
		if (onShareAction) {
			onShareAction(config.id);
		}
	};

	const handleEdit = () => {
		router.push(`/playground?id=${config.id}`);
		window.location.href = `/playground?id=${config.id}`;
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			// Basic check for invalid date
			if (isNaN(date.getTime())) {
				return 'Invalid Date';
			}
			return date.toLocaleDateString(undefined, {
				// Use locale-specific date format
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch (e) {
			console.error('Error formatting date:', dateString, e);
			return 'Invalid Date';
		}
	};

	return (
		<Box className={styles.configCard} p="4">
			<Flex direction="column" gap="2">
				<Text size="5" weight="bold">
					{config.title || 'Untitled Configuration'}
				</Text>
				<Text className={styles.description}>
					{config.description || 'No description provided.'}
				</Text>

				<Flex gap="2" direction="row" align="center" wrap="wrap">
					{' '}
					{/* Added wrap */}
					<Flex gap="1" align="center">
						<CalendarIcon />
						<Text size="1" className={styles.metaText}>
							{formatDate(config.createdAt)}
						</Text>
					</Flex>
					<Flex align="center" gap="1">
						<PersonIcon />
						<Text size="1" className={styles.metaText}>
							@{authorName || 'Unknown User'}
						</Text>
					</Flex>
					<Flex gap="1" direction="row" align="center">
						{config.isPublic ? (
							<>
								<EyeOpenIcon color="var(--accent-9)" />
								<Text size="1" className={styles.metaText}>
									Public
								</Text>
							</>
						) : (
							<>
								<LockClosedIcon color="var(--red-11)" />
								<Text size="1" className={styles.metaText}>
									Private
								</Text>
							</>
						)}
					</Flex>
				</Flex>

				{/* Action Buttons */}
				<Flex mt="3" gap="2" justify="end">
					{/* Conditionally render Delete button */}
					{onDeleteAction && (
						<Button
							variant="soft"
							color="red"
							onClick={() => onDeleteAction(config.id)} // Directly call handler
							// className={styles.deleteButton} // Use Radix props or global styles
							size="1" // Adjust size as needed
						>
							<TrashIcon /> Delete
						</Button>
					)}
					{/* Share Button */}
					{onShareAction && ( // Also make Share conditional if needed, but usually always shown
						<Button
							variant="soft"
							onClick={handleShare}
							// className={styles.shareButton}
							size="1"
						>
							<Share1Icon /> Share
						</Button>
					)}
					{/* Edit Button */}
					<Button
						variant="soft"
						onClick={handleEdit}
						// className={styles.editButton}
						size="1"
					>
						<Pencil2Icon /> Edit
					</Button>
				</Flex>
			</Flex>
		</Box>
	);
}
