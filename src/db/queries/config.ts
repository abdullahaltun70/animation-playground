// src/db/queries/config.ts
import type { SupabaseClient } from '@supabase/supabase-js';
// Definieer of importeer je Config interface
export interface Config {
	id: number;
	title: string;
	description: string | null;
	config_data: string | null;
	user_id: string;
	created_at: string;
	updated_at: string;
}

/**
 * Haalt configs op voor een gebruiker.
 * BELANGRIJK: Deze functie moet aangeroepen worden met een Supabase client
 * die geschikt is voor de context (client-side of server-side).
 * We gebruiken nu dependency injection: geef de client mee.
 */
export async function getConfigsByUserId(
	supabase: SupabaseClient, // Accepteer client als argument
	userId: string,
): Promise<Config[] | null> {
	// Geen client creatie hier! Gebruik de meegegeven client.
	const { data, error } = await supabase
		.from('configs_table')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('[DB Query] Error fetching configs by user ID:', error);
		// Gooi de error door of retourneer null/lege array, wees consistent
		throw error; // Of return null;
	}
	return data as Config[];
}

/**
 * Maakt een config aan.
 * BELANGRIJK: Deze functie moet aangeroepen worden met een SERVER Supabase client.
 * We gebruiken dependency injection.
 */
export async function createConfig(
	supabase: SupabaseClient, // Accepteer client als argument
	title: string,
	description: string | null,
	configData: string | null,
	userId: string,
): Promise<Config[] | null> {
	// Geen client creatie hier!
	const { data, error } = await supabase
		.from('configs_table')
		.insert([{ title, description, config_data: configData, user_id: userId }])
		.select();

	if (error) {
		console.error('[DB Query] Error creating config:', error);
		throw error; // Of return null;
	}
	// Supabase v2 retourneert array na insert+select
	if (!data || data.length === 0) {
		console.warn('[DB Query] No data returned after creating config.');
		return null; // Expliciet null retourneren als er niets terugkomt
	}
	return data as Config[];
}
