// types.ts
export interface Config {
	id: string;
	name: string;
	description: string;
	code_snippet: string;
	created_at: string;
	updated_at: string;
	user_id: string;
	is_public: boolean;
}

export type ConfigInsert = Omit<Config, 'id' | 'created_at' | 'updated_at'>;

export type ConfigUpdate = Partial<
	Omit<Config, 'id' | 'created_at' | 'updated_at' | 'user_id'>
>;
