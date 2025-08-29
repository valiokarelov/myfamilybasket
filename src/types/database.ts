// types/database.ts
export interface UserProfile {
  id: string;
  email: string;
  household_id: string | null;
  full_name: string | null; 
  role: string | null; 
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}