// src/utils/actions/supabase/configs.ts
'use server';

import { revalidatePath } from 'next/cache';

import * as ConfigQueries from '@/db/queries/config';
import type { Config } from '@/db/queries/config';
import { createClient } from '@/utils/supabase/server';

export async function saveConfig(
	title: string,
	description: string | null,
	configData: string | null,
): Promise<{ success: boolean; message: string; data?: Config[] }> {
	// Synchrone instantiatie
	const supabase = await createClient();

	try {
		// Haal gebruiker op
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		// Controleer authenticatie
		if (authError || !user) {
			console.error('[Server Action] Authentication error:', authError);
			return {
				success: false,
				message: 'Authentication required or session invalid.',
			};
		}

		// Valideer titel
		if (!title.trim()) {
			return { success: false, message: 'Please enter a config title.' };
		}

		// Roep de query aan
		const newConfig = await ConfigQueries.createConfig(
			supabase,
			title,
			description,
			configData,
			user.id,
		);

		// Controleer resultaat van query
		if (newConfig) {
			revalidatePath('/profile');
			return {
				success: true,
				message: 'Config saved successfully!',
				data: newConfig,
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
