// types/database.ts
export interface UserProfile {
  id: string;
  email: string; // Add this field
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  household_id: string | null;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}