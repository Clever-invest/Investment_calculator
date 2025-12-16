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
    console.error('Error fetching properties:', error.message);
    throw error;
  }

  return data || [];
};

// Get all properties (shared/public, regardless of user)
export const getAllProperties = async (): Promise<Property[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all properties:', error.message);
    throw error;
  }

  return data || [];
};

// Generate next serial number (SL-001, SL-002, ...)
export const generateNextSerialNumber = async (): Promise<string> => {
  // @ts-expect-error - RPC function not in generated types
  const { data, error } = await supabase.rpc('generate_next_serial_number');

  if (error) {
    console.error('Error generating serial number:', error.message);
    // Fallback: get max number manually
    const { data: properties } = await supabase
      .from('properties')
      .select('serial_number')
      .not('serial_number', 'is', null)
      .order('serial_number', { ascending: false })
      .limit(1);

    if (properties && properties.length > 0) {
      const lastSerial = properties[0].serial_number;
      const match = lastSerial?.match(/^SL-(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `SL-${nextNum.toString().padStart(3, '0')}`;
      }
    }
    return 'SL-001';
  }

  return data || 'SL-001';
};

// Get single property by ID
export const getProperty = async (id: string): Promise<Property | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error.message);
    return null;
  }

  return data;
};

// Create new property (with optional explicit ID for Storage consistency)
export const createProperty = async (
  property: Omit<PropertyInsert, 'user_id' | 'serial_number'>,
  explicitId?: string
): Promise<Property | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Generate serial number
  const serialNumber = await generateNextSerialNumber();

  const insertData: PropertyInsert & { id?: string } = {
    ...property,
    user_id: user.id,
    serial_number: serialNumber,
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
    console.error('Error creating property:', error.message);
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
    console.error('Error updating property:', error.message);
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
    console.error('Error archiving property:', error.message);
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
    console.error('Error deleting property:', error.message);
    throw error;
  }
};

// Update property images
export const updatePropertyImages = async (
  id: string,
  images: string[]
): Promise<void> => {
  // Фильтруем только пути (не base64, не URLs)
  // Пути должны быть в формате userId/propertyId/image_X.ext
  const validPaths = images.filter(img => {
    // Пропускаем base64
    if (img.startsWith('data:')) {
      console.warn('[propertiesApi] Filtering out base64 image:', img.substring(0, 50) + '...');
      return false;
    }
    // Пропускаем URLs (http/https)
    if (img.startsWith('http://') || img.startsWith('https://')) {
      console.warn('[propertiesApi] Filtering out URL instead of path:', img);
      return false;
    }
    // Оставляем только пути
    return true;
  });

  // Логируем только статистику, без ID
  // Debug: Updating property images
  if (images.length !== validPaths.length) {
    console.warn('[propertiesApi] Updating property images:', {
      totalImages: images.length,
      validPaths: validPaths.length,
      filteredOut: images.length - validPaths.length
    });
  }

  const { error } = await supabase
    .from('properties')
    .update({ 
      images: validPaths.length > 0 ? validPaths : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('[propertiesApi] Error updating property images:', {
      imageCount: validPaths.length,
      error: error.message
    });
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
