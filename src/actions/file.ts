import type { FileListOptions } from "@/entities/file/types";
import { supabase } from "../../supabase/client";

export async function uploadFile(file: File, filePath: string, bucket: string) {
  return await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
}

export async function uploadMultipleFiles(
  files: File[],
  filePaths: string[],
  bucket: string
) {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, filePaths[index], bucket)
  );
  return await Promise.all(uploadPromises);
}

export async function getFileList(options: FileListOptions) {
  const { bucket, folder = "", limit = 100, offset = 0 } = options;

  return await supabase.storage.from(bucket).list(folder, {
    limit,
    offset,
  });
}

export async function deleteFile(filePath: string, bucket: string) {
  return await supabase.storage.from(bucket).remove([filePath]);
}

export async function deleteFileByUrl(url: string, bucket: string) {
  // Проверяем, что URL не пустой
  if (!url || url.trim() === '') {
    console.warn('URL is empty, skipping file deletion');
    return { data: null, error: null };
  }

  // Проверяем, что URL является валидным
  try {
    new URL(url);
  } catch (error) {
    console.warn(`Invalid URL format, skipping file deletion: ${url}`);
    return { data: null, error: null };
  }

  // Проверяем, что URL содержит bucket
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex(part => part === bucket);
  
  if (bucketIndex === -1) {
    console.warn(`Bucket "${bucket}" not found in URL, skipping file deletion: ${url}`);
    return { data: null, error: null };
  }
  
  // Путь к файлу - это все части после bucket
  const filePath = urlParts.slice(bucketIndex + 1).join('/');
  
  // Проверяем, что путь к файлу не пустой
  if (!filePath || filePath.trim() === '') {
    console.warn(`File path is empty in URL, skipping file deletion: ${url}`);
    return { data: null, error: null };
  }
  
  return await supabase.storage.from(bucket).remove([filePath]);
}

export function getPublicUrl(filePath: string, bucket: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
