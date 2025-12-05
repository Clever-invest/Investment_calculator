import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'property-images';

// Upload image to Supabase Storage
export const uploadImage = async (
  userId: string,
  propertyId: string,
  file: File,
  index: number = 0
): Promise<string> => {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${userId}/${propertyId}/image_${index}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  return fileName;
};

// Get public URL for image
export const getImageUrl = (path: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
};

// Get signed URL for private image
export const getSignedImageUrl = async (
  path: string,
  expiresIn: number = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }

  return data.signedUrl;
};

// Delete image
export const deleteImage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Delete all images for a property
export const deletePropertyImages = async (
  userId: string,
  propertyId: string
): Promise<void> => {
  const folderPath = `${userId}/${propertyId}`;
  
  // List all files in the folder
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folderPath);

  if (listError) {
    console.error('Error listing images:', listError);
    return;
  }

  if (!files || files.length === 0) return;

  // Delete all files
  const filePaths = files.map(f => `${folderPath}/${f.name}`);
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (error) {
    console.error('Error deleting images:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadImages = async (
  userId: string,
  propertyId: string,
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadImage(userId, propertyId, file, index)
  );

  return Promise.all(uploadPromises);
};
