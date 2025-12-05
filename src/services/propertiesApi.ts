import { supabase } from '@/lib/supabase';
import type { Property, PropertyInsert, PropertyUpdate } from '@/types/database';

// Get all properties for current user
export const getProperties = async (): Promise<Property[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }

  return data || [];
};

// Get single property by ID
export const getProperty = async (id: string): Promise<Property | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  return data;
};

// Create new property (with optional explicit ID for Storage consistency)
export const createProperty = async (
  property: Omit<PropertyInsert, 'user_id'>,
  explicitId?: string
): Promise<Property | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const insertData: PropertyInsert & { id?: string } = {
    ...property,
    user_id: user.id,
  };
  
  // Use explicit ID if provided (for Storage path consistency)
  if (explicitId) {
    insertData.id = explicitId;
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }

  return data;
};

// Update property
export const updateProperty = async (
  id: string,
  updates: PropertyUpdate
): Promise<Property | null> => {
  const { data, error } = await supabase
    .from('properties')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }

  return data;
};

// Delete property (soft delete - archive)
export const archiveProperty = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('properties')
    .update({ is_archived: true })
    .eq('id', id);

  if (error) {
    console.error('Error archiving property:', error);
    throw error;
  }
};

// Permanently delete property
export const deleteProperty = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Update property images
export const updatePropertyImages = async (
  id: string,
  images: string[]
): Promise<void> => {
  const { error } = await supabase
    .from('properties')
    .update({ 
      images: images.length > 0 ? images : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating property images:', error);
    throw error;
  }
};

// Subscribe to real-time changes
export const subscribeToProperties = (
  callback: (properties: Property[]) => void
) => {
  const channel = supabase
    .channel('properties-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'properties',
      },
      async () => {
        // Refetch all properties on any change
        const properties = await getProperties();
        callback(properties);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
