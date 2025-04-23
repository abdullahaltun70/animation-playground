// types.ts
export interface Config {
  id: string;
  title: string;
  description: string | null;
  config_data: string | null;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}
