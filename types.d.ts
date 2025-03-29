// types.ts
export interface Config {
	id: number;
	config_data: string;
	title: string;
	description: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}

export type ConfigInsert = Omit<Config, 'id' | 'created_at' | 'updated_at'>;

export type ConfigUpdate = Partial<
	Omit<Config, 'id' | 'created_at' | 'updated_at' | 'user_id'>
>;
