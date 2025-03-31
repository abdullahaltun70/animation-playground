// src/utils/actions/supabase/configs.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createConfig } from '@/db/queries/create';
import { Config } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';

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
			revalidatePath('/profile');
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
