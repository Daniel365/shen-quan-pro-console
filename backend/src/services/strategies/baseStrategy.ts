import { UploadStrategy, UploadFileResult, UploadOptions } from '../../types/upload';

/**
 * 基础上传策略类
 */
export abstract class BaseUploadStrategy implements UploadStrategy {
  protected options: UploadOptions;

  constructor(options: UploadOptions = {}) {
    this.options = {
      folder: 'uploads',
      quality: 'auto',
      format: 'auto',
      ...options
    };
  }

  /**
   * 生成文件存储路径
   * @param file 文件对象
   * @param folder 文件夹路径
   * @returns 完整的存储路径
   */
  protected generateFilePath(file: Express.Multer.File, folder?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const folderPath = folder || this.options.folder || 'uploads';
    
    // 提取文件扩展名
    const ext = file.originalname.split('.').pop() || 'bin';
    
    // 生成文件名：时间戳_随机数.扩展名
    const filename = `${timestamp}_${randomString}.${ext}`;
    
    return `${folderPath}/${filename}`;
  }

  /**
   * 生成功能文件夹路径
   * @param functionType 功能类型（如：avatar, product, article）
   * @returns 带日期的文件夹路径
   */
  generateFunctionFolder(functionType: string = 'common'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${functionType}/${year}${month}${day}`;
  }

  /**
   * 获取文件信息
   */
  protected getFileInfo(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      extension: file.originalname.split('.').pop() || 'bin'
    };
  }

  /**
   * 验证文件类型
   */
  protected validateFileType(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    return allowedMimeTypes.includes(file.mimetype);
  }

  /**
   * 验证文件大小
   */
  protected validateFileSize(file: Express.Multer.File, maxSize: number = 10 * 1024 * 1024): boolean {
    return file.size <= maxSize;
  }

  abstract uploadSingle(file: Express.Multer.File): Promise<UploadFileResult>;
  abstract uploadMultiple(files: Express.Multer.File[]): Promise<UploadFileResult[]>;
  abstract deleteFile(publicId: string): Promise<boolean>;
}