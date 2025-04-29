export interface User {
  id: number;
  user_id: string;
  email: string;
  role: 'admin' | 'user';
  workspace_id: number;
  created_at?: string;
  updated_at?: string;
}