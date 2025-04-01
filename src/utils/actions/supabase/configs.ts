// src/utils/actions/supabase/configs.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createConfig } from '@/db/queries/create';
import { deleteConfig } from '@/db/queries/delete';
import { Config } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

/**
 * **Server action that saves a new configuration to the database.**
 *
 * @param title - Configuration title (required, max 30 chars)
 * @param description - Optional configuration description (max 255 chars)
 * @param configData - Optional JSON configuration data (max 10000 chars)
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 *   data?: Config[] - Array of created config(s) if successful
 * }>
 *
 * @throws Will redirect to /login if no valid session exists
 *
 * @example
 * const result = await saveConfig(
 *   title: "My Config",
 *   description: "Config description",
 *   configData: JSON.stringify({ key: "value" })
 * );
 */
export async function saveConfig(
	title: string,
	description: string | null,
	configData: string | null,
): Promise<{ success: boolean; message: string; data?: Config[] }> {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		console.error('[Server Action] Authentication error:', error);
		redirect('/login');
	}

	try {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.error('[Server Action] Authentication error:', authError);
			return {
				success: false,
				message: 'Authentication required or session invalid.',
			};
		}

		if (!title.trim()) {
			return { success: false, message: 'Please enter a config title.' };
		}

		if (title.length > 30) {
			return {
				success: false,
				message: 'Title cannot exceed 30 characters.',
			};
		}

		if (configData && configData.length > 10000) {
			return {
				success: false,
				message: 'Config data cannot exceed 10,000 characters.',
			};
		}
		if (description && description.length > 255) {
			return {
				success: false,
				message: 'Description cannot exceed 255 characters.',
			};
		}

		const newConfig = await createConfig(
			title,
			description,
			configData,
			user.id,
		);

		if (newConfig) {
			revalidatePath('/profile'); // removes cache for the profile page
			return {
				success: true,
				message: 'Config saved successfully!',
				data: newConfig.map((config) => ({
					title: config.title,
					id: config.id,
					configData: config.configData,
					description: config.description,
					userId: config.userId,
					createdAt: config.createdAt,
					updatedAt: config.updatedAt,
				})),
			};
		} else {
			return {
				success: false,
				message:
					'Failed to save config. Database operation might have failed or returned no data.',
			};
		}
	} catch (error) {
		console.error('[Server Action] Error saving config:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred.';
		return { success: false, message: `Error saving config: ${errorMessage}` };
	}
}

export async function removeConfig(
	configId: string,
): Promise<{ success: boolean; message: string }> {
	const supabase = await createClient();

	try {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return {
				success: false,
				message: 'Authentication required or session invalid.',
			};
		}

		await deleteConfig(configId);
		revalidatePath('/profile');

		return {
			success: true,
			message: 'Configuration deleted successfully',
		};
	} catch (error) {
		console.error('[Server Action] Error deleting config:', error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Failed to delete configuration',
		};
	}
}
