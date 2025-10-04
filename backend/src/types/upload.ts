export interface UploadFileResult {
  url: string;
  publicId?: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  originalName: string;
  uploadType: 'cloudinary' | 'local' | 'aws';
}

export interface UploadStrategy {
  uploadSingle(file: Express.Multer.File): Promise<UploadFileResult>;
  uploadMultiple(files: Express.Multer.File[]): Promise<UploadFileResult[]>;
  deleteFile(publicId: string): Promise<boolean>;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  quality?: 'auto' | number;
  format?: 'auto' | string;
}

export interface UploadConfig {
  strategy: 'cloudinary' | 'local' | 'aws';
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    defaultFolder?: string;
  };
  local?: {
    uploadPath: string;
    baseUrl: string;
  };
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint?: string;
    defaultFolder?: string;
  };
}