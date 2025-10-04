import { v2 as cloudinary } from 'cloudinary';
import { BaseUploadStrategy } from './baseStrategy';
import { UploadFileResult, UploadOptions } from '../../types/upload';

/**
 * Cloudinary上传策略实现
 */
export class CloudinaryStrategy extends BaseUploadStrategy {
  constructor(options: UploadOptions = {}) {
    super(options);

    // 配置Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * 上传单个文件到Cloudinary
   */
  async uploadSingle(file: Express.Multer.File): Promise<UploadFileResult> {
    // 验证文件类型和大小
    if (!this.validateFileType(file)) {
      throw new Error('不支持的文件类型');
    }

    if (!this.validateFileSize(file)) {
      throw new Error('文件大小超出限制');
    }

    try {
      // 生成存储路径
      const folderPath = this.generateFunctionFolder(this.options.folder);

      // 上传到Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folderPath,
        resource_type: 'auto',
        quality: this.options.quality,
        format: this.options.format,
        transformation: this.options.transformation,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        originalName: file.originalname,
        uploadType: 'cloudinary',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`Cloudinary上传失败: ${errorMessage}`);
    }
  }

  /**
   * 批量上传文件到Cloudinary
   */
  async uploadMultiple(files: Express.Multer.File[]): Promise<UploadFileResult[]> {
    const uploadPromises = files.map((file) => this.uploadSingle(file));
    return Promise.all(uploadPromises);
  }

  /**
   * 从Cloudinary删除文件
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`Cloudinary删除文件失败: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 生成带签名的上传URL（用于客户端直传）
   */
  generateUploadSignature(folder?: string): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
  } {
    const timestamp = Math.round(Date.now() / 1000);
    const folderPath = folder || this.generateFunctionFolder(this.options.folder);

    const params = {
      timestamp,
      folder: folderPath,
      ...this.options,
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET || ''
    );

    return {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    };
  }

  /**
   * 生成转换后的图片URL
   */
  generateTransformedUrl(publicId: string, transformations: any = {}): string {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // 检查Cloudinary配置是否正确
      const config = cloudinary.config();
      const cloudName = (config as any).cloud_name;
      const apiKey = (config as any).api_key;

      if (!cloudName || !apiKey) {
        return {
          status: 'unhealthy',
          details: {
            error: 'Cloudinary配置不完整',
          },
        };
      }

      // 测试ping操作
      await cloudinary.api.ping();

      return {
        status: 'healthy',
        details: {
          cloudName,
          apiKeyConfigured: !!apiKey,
          apiSecretConfigured: !!(cloudinary.config() as any).api_secret,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error,
        },
      };
    }
  }
}
