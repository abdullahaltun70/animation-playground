// app/(main)/profile/ProfileClientPage.tsx
'use client';

import React, { FormEvent, useState } from 'react';

import * as Form from '@radix-ui/react-form';
import { Pencil2Icon } from '@radix-ui/react-icons';
import * as Toast from '@radix-ui/react-toast';
import {
	Button,
	Card,
	Dialog,
	Flex,
	IconButton,
	Spinner,
	Text,
	TextField,
} from '@radix-ui/themes';
import { Trash2Icon } from 'lucide-react';
import Image from 'next/image';

import AlertNotification from '@/app/(auth)/login/components/AlertComponent';
import EditConfigDialog from '@/app/(main)/profile/components/EditConfigDialog';
import { SignOutButton } from '@/app/(main)/profile/components/SignOutButton';
import type { Config } from '@/db/schema';
import {
	removeConfigAction,
	saveConfigAction,
	updateConfigAction,
} from '@/utils/actions/supabase/configs';

import styles from './Profile.module.scss';

interface ProfileClientPageProps {
	userInfo: {
		id: string;
		email: string;
		name: string;
		avatar_url?: string;
	};
	initialConfigs: Config[];
	initialError: string | null;
}

export default function ProfileClientPage({
	userInfo,
	initialConfigs,
	initialError,
}: ProfileClientPageProps) {
	const [configs, setConfigs] = useState<Config[]>(initialConfigs);
	const [errorConfigs] = useState<string | null>(initialError);
	const [configTitle, setConfigTitle] = useState('');
	const [configDesc, setConfigDesc] = useState('');
	const [configDataString, setConfigDataString] = useState('');
	const [toastMessage, setToastMessage] = useState('');
	const [isPendingSave, setIsPendingSave] = useState(false);
	const [isPendingUpdate, setIsPendingUpdate] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [toastOpen, setToastOpen] = useState(false);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [configToDeleteId, setConfigToDeleteId] = useState<string | null>(null);

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingConfig, setEditingConfig] = useState<Config | null>(null);

	/**
	 * Handles saving a new config.
	 *
	 * @param e The form event.
	 *
	 * @returns A Promise that resolves to the result of the save operation.
	 *
	 */
	async function handleSaveConfig(e: FormEvent) {
		e.preventDefault();
		setIsPendingSave(true);
		setToastMessage('');
		try {
			const result = await saveConfigAction(
				configTitle,
				configDesc || null,
				configDataString || null,
			);
			setToastMessage(result.message);
			setToastOpen(true);
			if (result.success && result.data) {
				setConfigs((prevConfigs) => [...(result.data ?? []), ...prevConfigs]);
				setConfigTitle('');
				setConfigDesc('');
				setConfigDataString('');
			}
		} catch (error) {
			console.error('Error saving config:', error);
			setToastMessage(
				error instanceof Error
					? `Error: ${error.message}`
					: 'An unknown error occurred',
			);
			setToastOpen(true);
		} finally {
			setIsPendingSave(false);
		}
	}

	/**
	 * Handles initiating the deletion of a config.
	 *
	 * @param configId The ID of the config to be deleted.
	 *
	 */
	function handleDeleteInitiate(configId: string) {
		setConfigToDeleteId(configId);
		setShowDeleteConfirm(true);
	}

	/**
	 * Handles confirming the deletion of a config.
	 */
	async function handleConfirmDelete() {
		if (!configToDeleteId) return;
		setIsDeleting(true);
		setToastMessage('');
		try {
			const result = await removeConfigAction(configToDeleteId);
			setToastMessage(result.message);
			setToastOpen(true);
			if (result.success) {
				setConfigs((prevConfigs) =>
					prevConfigs.filter((c) => c.id !== configToDeleteId),
				);
			}
		} catch (error) {
			console.error('Error deleting config:', error);
			setToastMessage(
				error instanceof Error
					? `Error: ${error.message}`
					: 'An unknown error occurred',
			);
			setToastOpen(true);
		} finally {
			setShowDeleteConfirm(false);
			setConfigToDeleteId(null);
			setIsDeleting(false);
		}
	}

	/**
	 * Handles opening the edit modal for the selected config.
	 */
	function handleEditInitiate(config: Config) {
		setEditingConfig(config);
		setIsEditModalOpen(true); // Open de modal
	}

	/**
	 * Handles saving the edited config data.
	 * Called by the EditConfigDialog component.
	 */
	async function handleEditSave(updatedData: Partial<Config>) {
		if (!editingConfig) return;
		setIsPendingUpdate(true);
		setToastMessage('');
		try {
			const result = await updateConfigAction(editingConfig.id, updatedData);
			setToastMessage(result.message);
			setToastOpen(true);
			if (result.success && result.data) {
				setConfigs((prevConfigs) =>
					prevConfigs.map((c) =>
						c.id === editingConfig.id ? result.data || c : c,
					),
				);
			}
		} catch (error) {
			console.error('Error updating config:', error);
			setToastMessage(
				error instanceof Error
					? `Error: ${error.message}`
					: 'An unknown error occurred while updating',
			);
			setToastOpen(true);
		} finally {
			setIsPendingUpdate(false);
		}
	}

	/**
	 * Handles closing the edit modal without saving.
	 */
	function handleEditCancel() {
		setIsEditModalOpen(false);
		setEditingConfig(null);
	}

	return (
		<Toast.Provider swipeDirection="right">
			<div className={styles.profileContainer}>
				<h1>Profile</h1>
				{userInfo && (
					<Flex
						justify="between"
						align="center"
						mb="5"
						className={styles.userInfoContainer}
					>
						<Flex direction="column" gap="1">
							<h2>Welcome, {userInfo.name}</h2>
							<Text size="2" color="gray" mb="3">
								Email: {userInfo.email}
							</Text>
							<SignOutButton />
						</Flex>
						{userInfo.avatar_url && (
							<Image
								src={userInfo.avatar_url}
								alt="Profile"
								className={styles.avatar}
								width={64}
								height={64}
							/>
						)}
					</Flex>
				)}
				<div className={styles.configForm}>
					<h2>Create New Config</h2>
					<Form.Root onSubmit={handleSaveConfig}>
						<Form.Field className={styles.formGroup} name="title">
							<Flex justify="between" align="baseline" mb="1">
								<Form.Label className={styles.formLabel}>Title</Form.Label>
								<Form.Message
									className={styles.formMessage}
									match="valueMissing"
								>
									Required
								</Form.Message>
							</Flex>
							<Form.Control asChild>
								<TextField.Root
									id="configTitle"
									type="text"
									value={configTitle}
									onChange={(e) => setConfigTitle(e.target.value)}
									className={styles.inputField}
									required
								/>
							</Form.Control>
						</Form.Field>
						<Form.Field className={styles.formGroup} name="description">
							<Flex justify="between" align="baseline" mb="1">
								<Form.Label className={styles.formLabel}>
									Description
								</Form.Label>
							</Flex>
							<Form.Control asChild>
								<TextField.Root
									id="configDesc"
									value={configDesc}
									onChange={(e) => setConfigDesc(e.target.value)}
									className={styles.textareaField}
								/>
							</Form.Control>
						</Form.Field>
						<Form.Field className={styles.formGroup} name="data">
							<Flex justify="between" align="baseline" mb="1">
								<Form.Label className={styles.formLabel}>
									Config Data
								</Form.Label>
							</Flex>
							<Form.Control asChild>
								<TextField.Root
									id="configData"
									value={configDataString}
									onChange={(e) => setConfigDataString(e.target.value)}
									className={styles.textareaField}
								/>
							</Form.Control>
						</Form.Field>

						<Form.Submit asChild name={'save-button'}>
							<Button type="submit" disabled={isPendingSave}>
								{isPendingSave && <Spinner size="1" />}{' '}
								{isPendingSave ? ' Saving...' : ' Save Config'}
							</Button>
						</Form.Submit>
					</Form.Root>
				</div>
				{/* Toast Components */}
				<Toast.Root
					open={toastOpen}
					onOpenChange={setToastOpen}
					className={styles.ToastRoot}
					duration={3000}
				>
					<Toast.Title className={styles.ToastTitle}>Notification</Toast.Title>
					<Toast.Description className={styles.ToastDescription}>
						{toastMessage}
					</Toast.Description>
					<Toast.Action asChild altText="Close">
						<Button variant="soft" color="green" size="1" type="button">
							Close
						</Button>
					</Toast.Action>
				</Toast.Root>
				<Toast.Viewport className={styles.ToastViewport} />
				<div className={styles.configsList}>
					<h2>Your Configs</h2>
					{errorConfigs ? (
						<Text color="red" className={styles.error}>
							{errorConfigs}
						</Text>
					) : configs.length > 0 ? (
						<div className={styles.grid}>
							{configs.map((config) => (
								<Card key={config.id} className={styles.card}>
									<Flex justify="between" align="start" width="100%">
										<div className={styles.contentArea}>
											<h3>{config.title}</h3>
											{config.description && (
												<Text as="p" size="2" color="gray">
													{config.description}
												</Text>
											)}
											<Text as="p" size="1" className={styles.date}>
												Created: {new Date(config.createdAt).toDateString()}
											</Text>
										</div>
										<Flex gap="2" className={styles.actionIcons} align="center">
											<IconButton
												variant="ghost"
												color="gray"
												onClick={() => handleDeleteInitiate(config.id)}
												disabled={isDeleting}
												aria-label={`Delete config ${config.title}`}
												style={{
													cursor: isDeleting ? 'not-allowed' : 'pointer',
												}}
											>
												<Trash2Icon size={18} />
											</IconButton>
											{/* Edit Dialog Trigger & Content */}
											<Dialog.Root
												open={
													isEditModalOpen && editingConfig?.id === config.id
												}
												onOpenChange={(open) => {
													if (!open) handleEditCancel();
												}}
											>
												<Dialog.Trigger>
													<IconButton
														variant="ghost"
														color="gray"
														onClick={() => handleEditInitiate(config)}
														disabled={isPendingUpdate}
														aria-label={`Edit config ${config.title}`}
														style={{
															cursor: isPendingUpdate
																? 'not-allowed'
																: 'pointer',
														}}
													>
														<Pencil2Icon width={18} height={18} />
													</IconButton>
												</Dialog.Trigger>

												<Dialog.Content style={{ maxWidth: 650 }}>
													<Dialog.Title>Edit Configuration</Dialog.Title>
													<Dialog.Description size="2" mb="4">
														Make changes to &#39;{editingConfig?.title}&#39;.
													</Dialog.Description>
													{/* EditConfigDialog */}
													{editingConfig && (
														<EditConfigDialog
															config={editingConfig}
															onSave={handleEditSave}
															onCancel={handleEditCancel}
														/>
													)}
												</Dialog.Content>
											</Dialog.Root>
										</Flex>
									</Flex>
								</Card>
							))}
						</div>
					) : (
						<Text color="gray">No configs yet. Create one above!</Text>
					)}
				</div>
				{/* Delete Confirmation Dialog (blijft hetzelfde) */}
				<AlertNotification
					showAlert={showDeleteConfirm}
					setShowAlert={setShowDeleteConfirm}
					alertTitle="Confirm Deletion"
					alertMessage={`Are you sure you want to delete the configuration "${configs.find((c) => c.id === configToDeleteId)?.title ?? ''}"? This action cannot be undone.`}
					onConfirm={handleConfirmDelete}
					confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
				/>{' '}
			</div>
		</Toast.Provider>
	);
}
