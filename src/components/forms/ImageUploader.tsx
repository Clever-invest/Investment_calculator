/**
 * Компонент загрузки изображений объекта
 * Поддерживает как локальное хранение (base64), так и Supabase Storage
 */

import React, { useState, useCallback } from 'react';
import { Loader2, Upload, X, Cloud, CloudOff } from 'lucide-react';
import { uploadImage, deleteImage, getSignedImageUrl } from '@/services/imageStorage';
import { updatePropertyImages } from '@/services/propertiesApi';
import { useAuthStore } from '@/stores';

interface ImageUploaderProps {
  images: string[];
  maxImages?: number;
  propertyId?: string;
  useCloudStorage?: boolean;
  onChange: (images: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  maxImages = 5,
  propertyId,
  useCloudStorage = false,
  onChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const user = useAuthStore((state) => state.user);

  // Определяем, можем ли использовать облачное хранилище
  const canUseCloud = useCloudStorage && user && propertyId;

  // Получить URL для отображения (signed URL для cloud, сам путь для base64)
  const getDisplayUrl = useCallback(async (imagePath: string): Promise<string> => {
    // Если это base64 или обычный URL — возвращаем как есть
    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      return imagePath;
    }
    // Иначе это путь в Storage — получаем signed URL
    try {
      return await getSignedImageUrl(imagePath);
    } catch {
      return imagePath;
    }
  }, []);

  // Состояние для отображаемых URL
  const [displayUrls, setDisplayUrls] = useState<Record<string, string>>({});

  // Загрузить display URLs при изменении images
  React.useEffect(() => {
    const loadUrls = async () => {
      const urls: Record<string, string> = {};
      for (const img of images) {
        if (!displayUrls[img]) {
          urls[img] = await getDisplayUrl(img);
        } else {
          urls[img] = displayUrls[img];
        }
      }
      setDisplayUrls(urls);
    };
    loadUrls();
  }, [images, getDisplayUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Загрузка изображений
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (canUseCloud) {
      // Загрузка в Supabase Storage
      setIsUploading(true);
      setUploadProgress(0);

      const newPaths: string[] = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        try {
          const path = await uploadImage(user.id, propertyId, file, images.length + i);
          newPaths.push(path);
          setUploadProgress(((i + 1) / filesToProcess.length) * 100);
        } catch (error) {
          console.error('Upload error:', error);
        }
      }

      if (newPaths.length > 0) {
        const updatedImages = [...images, ...newPaths];
        onChange(updatedImages);
        
        // Сохраняем пути в БД (только Storage пути, без base64)
        const storagePaths = updatedImages.filter(img => !img.startsWith('data:'));
        try {
          await updatePropertyImages(propertyId, storagePaths);
        } catch (error) {
          console.error('Failed to sync images to DB:', error);
        }
      }
      setIsUploading(false);
    } else {
      // Локальное хранение в base64
      // Собираем все файлы перед обновлением state чтобы избежать race condition
      const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Читаем все файлы параллельно
      Promise.all(filesToProcess.map(readFileAsBase64))
        .then((base64Images) => {
          const newImages = [...images, ...base64Images];
          onChange(newImages);
        })
        .catch((error) => {
          console.error('Error reading files:', error);
        });
    }

    // Сбросить input
    e.target.value = '';
  };

  // Удаление изображения
  const removeImage = async (index: number) => {
    const imagePath = images[index];

    // Если это облачный путь — удаляем из Storage
    if (canUseCloud && !imagePath.startsWith('data:') && !imagePath.startsWith('http')) {
      try {
        await deleteImage(imagePath);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);
    
    // Обновляем БД после удаления
    if (canUseCloud) {
      const storagePaths = updatedImages.filter(img => !img.startsWith('data:'));
      try {
        await updatePropertyImages(propertyId!, storagePaths);
      } catch (error) {
        console.error('Failed to sync images to DB:', error);
      }
    }
  };

  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        📷 Фото объекта ({images.length}/{maxImages})
        {canUseCloud ? (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Cloud size={12} /> Облако
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <CloudOff size={12} /> Локально
          </span>
        )}
      </label>
      <div className="space-y-2">
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={displayUrls[img] || img}
                  alt={`Фото ${idx + 1}`}
                  className="w-full h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    // Fallback для ошибки загрузки
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="%23ccc"><rect width="64" height="64"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">Ошибка</text></svg>';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < maxImages && (
          <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploading 
              ? 'border-blue-400 bg-blue-50 cursor-wait' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}>
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin text-blue-500" />
                <span className="text-blue-600 text-sm">Загрузка {Math.round(uploadProgress)}%</span>
              </>
            ) : (
              <>
                <Upload size={18} className="text-gray-400" />
                <span className="text-gray-500 text-sm">Добавить фото</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};
