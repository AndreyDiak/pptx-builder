import type { FileListOptions } from '@/entities/file/types';
import { supabase } from '../../supabase/client';




export async function uploadFile(
  file: File, 
  filePath: string,
  bucket: string
) {
  return await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
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
  const { bucket, folder = '', limit = 100, offset = 0 } = options;
  
  return await supabase.storage
    .from(bucket)
    .list(folder, {
      limit,
      offset,
    });
}


export async function deleteFile(filePath: string, bucket: string) {
  return await supabase.storage
    .from(bucket)
    .remove([filePath]);
}


export function getPublicUrl(filePath: string, bucket: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
}
