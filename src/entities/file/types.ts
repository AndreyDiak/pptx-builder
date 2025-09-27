export interface FileUploadOptions {
  bucket: string;
  folder?: string;
  usePath?: boolean;
}

export interface FileListOptions {
  bucket: string;
  folder?: string;
  limit?: number;
  offset?: number;
}