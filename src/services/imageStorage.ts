import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'property-images';

// Upload image to Supabase Storage
export const uploadImage = async (
  userId: string,
  propertyId: string,
  file: File,
  index: number = 0
): Promise<string> => {
  // Валидация параметров
  if (!userId || !propertyId) {
    const error = new Error('Invalid parameters: missing userId or propertyId');
    console.error('[imageStorage] uploadImage validation error: missing required parameters');
    throw error;
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${userId}/${propertyId}/image_${index}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('[imageStorage] Error uploading image:', {
      fileName: fileName.split('/').pop(), // Только имя файла, без пути
      bucket: BUCKET_NAME,
      fileSize: file.size,
      fileType: file.type,
      error: error.message
    });
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
  // Валидация пути
  if (!path || typeof path !== 'string' || path.trim().length === 0) {
    const error = new Error('Invalid image path: path is empty or invalid');
    console.error('[imageStorage] getSignedImageUrl validation error: invalid path format');
    throw error;
  }

  // Проверка формата пути (должен быть userId/propertyId/image_X.ext)
  const pathPattern = /^[^/]+\/[^/]+\/image_\d+\.[a-zA-Z0-9]+$/;
  if (!pathPattern.test(path)) {
    console.warn('[imageStorage] Unexpected path format detected');
    // Не выбрасываем ошибку, так как формат может отличаться
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('[imageStorage] Error getting signed URL:', {
        bucket: BUCKET_NAME,
        expiresIn,
        error: error.message
      });
      throw error;
    }

    if (!data?.signedUrl) {
      const error = new Error('No signed URL returned from storage');
      console.error('[imageStorage] No signed URL in response');
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    // Дополнительное логирование для диагностики
    console.error('[imageStorage] getSignedImageUrl failed:', {
      bucket: BUCKET_NAME,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

// Delete image
export const deleteImage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error.message);
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
    console.error('Error listing images:', listError.message);
    return;
  }

  if (!files || files.length === 0) return;

  // Delete all files
  const filePaths = files.map(f => `${folderPath}/${f.name}`);
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (error) {
    console.error('Error deleting images:', error.message);
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
