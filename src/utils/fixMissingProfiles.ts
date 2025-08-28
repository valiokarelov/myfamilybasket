// utils/fixMissingProfiles.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function createMissingUserProfile(userId: string, email: string) {
  const supabase = createClientComponentClient();
  
  try {
    console.log('Creating missing user profile for:', userId, email);
    
    // First, check if household already exists for this user
    const { data: existingHousehold, error: checkError } = await supabase
      .from('households')
      .select('*')
      .eq('created_by', userId)
      .single();

    let household = existingHousehold;

    if (checkError && checkError.code === 'PGRST116') {
      // No household found, create one
      console.log('No existing household found, creating new one...');
      
      const { data: newHousehold, error: householdError } = await supabase
        .from('households')
        .insert({
          name: `${email.split('@')[0]}'s Household`,
          created_by: userId
        })
        .select()
        .single();
      
      if (householdError) {
        console.error('Error creating household:', householdError);
        throw new Error(`Failed to create household: ${householdError.message}`);
      }
      
      household = newHousehold;
      console.log('Created household:', household);
    } else if (checkError) {
      console.error('Error checking for existing household:', checkError);
      throw new Error(`Failed to check household: ${checkError.message}`);
    } else {
      console.log('Using existing household:', household);
    }
    
    // Then create the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        household_id: household.id,
        first_name: null,
        last_name: null
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }
    
    console.log('Created user profile:', profile);
    return profile;
    
  } catch (error) {
    console.error('Failed to create missing user profile:', error);
    throw error;
  }
}

// Debug function to manually fix a user account
export async function debugFixUserAccount() {
  const supabase = createClientComponentClient();
  
  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('No authenticated user found:', error);
    return;
  }
  
  console.log('Current user:', user);
  
  // Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (profileError && profileError.code === 'PGRST116') {
    // Profile doesn't exist, create it
    console.log('Profile not found, creating...');
    await createMissingUserProfile(user.id, user.email!);
  } else if (profileError) {
    console.error('Error checking profile:', profileError);
  } else {
    console.log('Profile exists:', profile);
  }
}