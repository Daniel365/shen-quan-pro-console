import { CloudinaryStrategy } from './strategies/cloudinaryStrategy';
import { LocalStrategy } from './strategies/localStrategy';
import { AwsStrategy } from './strategies/awsStrategy';
import { UploadStrategy, UploadFileResult, UploadOptions, UploadConfig } from '../types/upload';

/**
 * 上传策略工厂
 */
export class UploadStrategyFactory {
  /**
   * 创建上传策略实例
   */
  static createStrategy(config: UploadConfig): UploadStrategy {
    const { strategy, cloudinary, local, aws } = config;

    switch (strategy) {
      case 'cloudinary':
        if (!cloudinary || !cloudinary.cloudName || !cloudinary.apiKey || !cloudinary.apiSecret) {
          throw new Error('Cloudinary配置不完整');
        }

        // 设置环境变量
        process.env.CLOUDINARY_CLOUD_NAME = cloudinary.cloudName;
        process.env.CLOUDINARY_API_KEY = cloudinary.apiKey;
        process.env.CLOUDINARY_API_SECRET = cloudinary.apiSecret;

        return new CloudinaryStrategy({
          folder: cloudinary.defaultFolder,
        });

      case 'local':
        return new LocalStrategy({
          uploadPath: local?.uploadPath,
          baseUrl: local?.baseUrl,
        });

      case 'aws':
        if (!aws || !aws.region || !aws.accessKeyId || !aws.secretAccessKey || !aws.bucketName) {
          throw new Error('AWS配置不完整');
        }

        return new AwsStrategy({
          region: aws.region,
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucketName: aws.bucketName,
          endpoint: aws.endpoint,
          folder: aws.defaultFolder,
        });

      default:
        throw new Error(`不支持的存储策略: ${strategy}`);
    }
  }

  /**
   * 根据环境变量创建策略
   */
  static createFromEnv(): UploadStrategy {
    const strategy = process.env.UPLOAD_STRATEGY || 'local';

    const config: UploadConfig = {
      strategy: strategy as 'cloudinary' | 'local' | 'aws',
    };

    if (strategy === 'cloudinary') {
      config.cloudinary = {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        defaultFolder: process.env.CLOUDINARY_DEFAULT_FOLDER,
      };
    } else if (strategy === 'aws') {
      config.aws = {
        region: process.env.AWS_REGION || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        bucketName: process.env.AWS_BUCKET_NAME || '',
        endpoint: process.env.AWS_ENDPOINT,
        defaultFolder: process.env.AWS_DEFAULT_FOLDER,
      };
    } else {
      config.local = {
        uploadPath: process.env.LOCAL_UPLOAD_PATH || '',
        baseUrl: process.env.BASE_URL || '',
      };
    }

    return this.createStrategy(config);
  }
}

/**
 * 上传服务
 */
export class UploadService {
  private strategy: UploadStrategy;

  constructor(strategy?: UploadStrategy) {
    this.strategy = strategy || UploadStrategyFactory.createFromEnv();
  }

  /**
   * 设置上传策略
   */
  setStrategy(strategy: UploadStrategy): void {
    this.strategy = strategy;
  }

  /**
   * 上传单个文件
   */
  async uploadSingle(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadFileResult> {
    try {
      // 如果传入了自定义选项，创建新的策略实例
      if (options) {
        const factory = new UploadStrategyFactory();
        // 这里可以根据需要重新创建策略实例
      }
      return await this.strategy.uploadSingle(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`文件上传失败: ${errorMessage}`);
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    options?: UploadOptions
  ): Promise<UploadFileResult[]> {
    try {
      return await this.strategy.uploadMultiple(files);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`批量文件上传失败: ${errorMessage}`);
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(publicId: string): Promise<boolean> {
    return await this.strategy.deleteFile(publicId);
  }

  /**
   * 生成上传配置（用于前端直传）
   */
  async generateUploadConfig(functionType: string = 'common') {
    // 如果是Cloudinary策略，生成签名
    if (this.strategy instanceof CloudinaryStrategy) {
      const folder = this.strategy.generateFunctionFolder(functionType);
      return {
        strategy: 'cloudinary',
        signature: this.strategy.generateUploadSignature(folder),
        endpoint: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
      };
    }

    // 如果是AWS策略，生成预签名URL
    if (this.strategy instanceof AwsStrategy) {
      return await this.strategy.generateUploadConfig(functionType);
    }

    // 如果是本地策略，返回上传端点
    return {
      strategy: 'local',
      endpoint: '/api/v1.0/upload/single',
    };
  }

  /**
   * 获取当前使用的策略类型
   */
  getCurrentStrategy(): string {
    if (this.strategy instanceof CloudinaryStrategy) {
      return 'cloudinary';
    } else if (this.strategy instanceof LocalStrategy) {
      return 'local';
    } else if (this.strategy instanceof AwsStrategy) {
      return 'aws';
    }
    return 'unknown';
  }

  /**
   * 获取上传策略信息
   */
  getUploadStrategy(): { strategy: string; features: string[] } {
    const strategy = this.getCurrentStrategy();
    const features = [];

    if (this.strategy instanceof CloudinaryStrategy) {
      features.push('imageOptimization', 'cdn', 'videoProcessing');
    } else if (this.strategy instanceof AwsStrategy) {
      features.push('largeFileSupport', 'globalCDN', 'versioning');
    } else {
      features.push('simpleStorage', 'fileManagement');
    }

    return {
      strategy,
      features,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const strategy = this.getCurrentStrategy();
      const result = await (this.strategy as any).healthCheck?.();

      return {
        status: 'healthy',
        details: {
          strategy,
          ...result,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        status: 'unhealthy',
        details: {
          error: errorMessage,
        },
      };
    }
  }

  /**
   * 获取存储使用情况（仅本地存储）
   */
  async getStorageUsage(): Promise<any> {
    if (this.strategy instanceof LocalStrategy) {
      return await this.strategy.getStorageUsage?.();
    }
    return null;
  }
}
