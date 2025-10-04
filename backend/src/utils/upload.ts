/**
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 16:51:16
 * @Explain: 上传工具类
 */
import multer, { FileFilterCallback } from 'multer';
import * as path from 'path';
import { UploadService } from '../services/uploadService';
import { i18nText } from './i18n';

// 使用 Multer 的类型定义
type MulterFile = Express.Multer.File;

export interface UploadConfig {
  uploadPath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  allowedMimeTypes?: string[];
}

export interface UploadResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

/**
 * 上传工具类
 */
export class UploadUtils {
  private uploadService: UploadService;
  public uploadConfig: UploadConfig;

  constructor(config?: UploadConfig) {
    this.uploadService = new UploadService();
    this.uploadConfig = {
      uploadPath: '/tmp/uploads',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      ...config,
    };
  }

  /**
   * 创建 multer 实例
   */
  createMulter() {
    const storage = multer.diskStorage({
      destination: (
        req: any,
        file: MulterFile,
        cb: (error: Error | null, destination: string) => void
      ) => {
        // 使用配置的目录存储上传的文件
        cb(null, this.uploadConfig.uploadPath || '');
      },
      filename: (
        req: any,
        file: MulterFile,
        cb: (error: Error | null, filename: string) => void
      ) => {
        // 生成唯一文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(file.originalname) || '.bin';
        cb(null, `${timestamp}_${randomString}${ext}`);
      },
    });

    // 文件过滤器
    const fileFilter = (req: any, file: MulterFile, cb: FileFilterCallback) => {
      if (this.uploadConfig.allowedMimeTypes?.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.uploadConfig.maxFileSize,
        files: this.uploadConfig.maxFiles,
      },
    });
  }

  /**
   * 统一验证上传请求（包括请求格式和文件验证）
   */
  static validateUploadRequest(
    req: any,
    files?: Express.Multer.File[]
  ): { isValid: boolean; error?: string } {
    const contentType = req.headers['content-type'];

    // 1. 检查请求格式
    if (!contentType) {
      return { isValid: false, error: 'contentTypeRequired' };
    }

    if (!contentType.includes('multipart/form-data')) {
      return { isValid: false, error: 'invalidContentType' };
    }

    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    if (!boundaryMatch || !boundaryMatch[1]) {
      return { isValid: false, error: 'boundaryRequired' };
    }

    // 2. 检查文件是否存在
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return { isValid: false, error: 'noFilesSelected' };
    }

    // 3. 验证文件内容
    const uploadUtils = new UploadUtils();

    if (Array.isArray(files)) {
      // 批量验证
      for (const file of files) {
        const validation = uploadUtils.validateFile(file, false); // 不检查存在性
        if (!validation.isValid) {
          return validation;
        }
      }
    } else {
      // 单个文件验证
      const validation = uploadUtils.validateFile(files, false); // 不检查存在性
      if (!validation.isValid) {
        return validation;
      }
    }

    return { isValid: true };
  }

  /**
   * 统一验证文件（包括文件存在性、类型和大小）
   * @param file 文件对象
   * @param checkExists 是否检查文件存在性（默认true）
   */
  validateFile(
    file: MulterFile,
    checkExists: boolean = true
  ): { isValid: boolean; error?: string } {
    // 检查文件存在性
    if (checkExists && !file) {
      return { isValid: false, error: 'noFileSelected' };
    }

    // 检查文件类型
    if (!this.uploadConfig.allowedMimeTypes?.includes(file.mimetype)) {
      return { isValid: false, error: 'fileTypeNotSupported' };
    }

    // 检查文件大小
    const maxSize = this.uploadConfig.maxFileSize || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'fileSizeExceeded' };
    }

    return { isValid: true };
  }

  /**
   * 上传单个文件
   */
  async uploadSingle(file: MulterFile, options?: any): Promise<UploadResult> {
    try {
      // 验证文件
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: i18nText(`upload.${validation.error}`),
        };
      }

      const result = await this.uploadService.uploadSingle(file, options);

      return {
        success: true,
        data: result,
        message: i18nText('upload.uploadSuccess'),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.uploadFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultiple(files: MulterFile[], options?: any): Promise<UploadResult> {
    try {
      if (!files || files.length === 0) {
        return {
          success: false,
          error: i18nText('upload.noFilesSelected'),
        };
      }

      // 验证所有文件
      for (const file of files) {
        const validation = this.validateFile(file);
        if (!validation.isValid) {
          return {
            success: false,
            error: i18nText('upload.fileValidationFailed', { error: validation.error }),
          };
        }
      }

      const results = await this.uploadService.uploadMultiple(files, options);

      return {
        success: true,
        data: results,
        message: i18nText('upload.batchUploadSuccessWithCount', { count: results.length }),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.batchUploadFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(publicId: string): Promise<UploadResult> {
    try {
      if (!publicId) {
        return {
          success: false,
          error: i18nText('upload.fileIdRequired'),
        };
      }

      const success = await this.uploadService.deleteFile(publicId);

      if (success) {
        return {
          success: true,
          message: i18nText('upload.deleteSuccess'),
        };
      } else {
        return {
          success: false,
          error: i18nText('upload.deleteFailed'),
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.deleteFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 获取上传配置
   */
  async getUploadConfig(functionType: string = 'common'): Promise<UploadResult> {
    try {
      const config = await this.uploadService.generateUploadConfig(functionType);

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.getConfigFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 获取上传策略信息
   */
  getUploadStrategy(): UploadResult {
    try {
      const strategyInfo = this.uploadService.getUploadStrategy();

      return {
        success: true,
        data: strategyInfo,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.getStrategyFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<UploadResult> {
    try {
      const health = await this.uploadService.healthCheck();

      return {
        success: true,
        data: health,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.healthCheckFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<UploadResult> {
    try {
      const usage = await this.uploadService.getStorageUsage();

      return {
        success: true,
        data: usage || { message: i18nText('upload.onlyLocalSupported') },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18nText('upload.unknownError');
      return {
        success: false,
        error: i18nText('upload.getStorageUsageFailedWithError', { error: errorMessage }),
      };
    }
  }

  /**
   * 设置上传配置
   */
  setConfig(config: UploadConfig): void {
    this.uploadConfig = { ...this.uploadConfig, ...config };
  }
}

// 创建默认实例
export const uploadUtils = new UploadUtils();

// 便捷函数
export const createUpload = (config?: UploadConfig) => new UploadUtils(config);
export const getMulter = (config?: UploadConfig) => new UploadUtils(config).createMulter();
