-- RLS политики для Storage bucket 'property-images'
-- Позволяют читать изображения для объектов в общем доступе

-- ВАЖНО: Если функция storage.foldername() недоступна, используйте альтернативный вариант ниже
-- (раскомментируйте альтернативные политики и закомментируйте эти)

-- 1. Политика для SELECT (чтение) - разрешает читать изображения:
--    - Свои собственные изображения
--    - Изображения объектов, которые доступны всем (is_archived = false и объект существует в таблице properties)

-- Вариант 1: С использованием storage.foldername() (если доступна)
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images' AND
  (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can view images for shared properties"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images' AND
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id::text = (storage.foldername(name))[2]
    AND properties.is_archived = false
  )
);

-- Альтернативный вариант (если storage.foldername() недоступна):
-- Раскомментируйте эти политики и закомментируйте варианты выше
/*
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images' AND
  (auth.uid()::text = split_part(name, '/', 1))
);

CREATE POLICY "Users can view images for shared properties"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images' AND
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id::text = split_part(name, '/', 2)
    AND properties.is_archived = false
  )
);
*/

-- 2. Политика для INSERT (загрузка) - разрешает загружать только свои изображения
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Альтернативный вариант:
/*
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);
*/

-- 3. Политика для UPDATE (обновление) - разрешает обновлять только свои изображения
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Альтернативный вариант:
/*
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);
*/

-- 4. Политика для DELETE (удаление) - разрешает удалять только свои изображения
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Альтернативный вариант:
/*
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);
*/

