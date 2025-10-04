import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { BaseUploadStrategy } from './baseStrategy';
import { UploadFileResult, UploadOptions } from '../../types/upload';

/**
 * AWS上传策略实现
 */
export class AwsStrategy extends BaseUploadStrategy {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(options: UploadOptions & { 
    region?: string; 
    accessKeyId?: string; 
    secretAccessKey?: string; 
    bucketName?: string;
    endpoint?: string;
  } = {}) {
    super(options);

    this.region = options.region || process.env.AWS_REGION || 'us-east-1';
    this.bucketName = options.bucketName || process.env.AWS_S3_BUCKET_NAME || '';

    // 配置S3客户端
    const config: any = {
      region: this.region,
      credentials: {
        accessKeyId: options.accessKeyId || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };

    // 如果是自定义端点（如兼容S3的其他服务）
    if (options.endpoint) {
      config.endpoint = options.endpoint;
      config.forcePathStyle = true; // 路径样式访问
    }

    this.s3Client = new S3Client(config);
  }

  /**
   * 上传单个文件到AWS
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
      // 生成AWS存储路径
      const folderName = this.generateFunctionFolder(this.options.folder);
      const key = this.generateFilePath(file, folderName);

      // 设置Content-Type
      const contentType = file.mimetype;

      // 上传文件到AWS
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer, // 使用内存中的文件缓冲区
        ContentType: contentType,
        ContentLength: file.size,
        ACL: 'public-read' // 设置公开读取权限
      });

      await this.s3Client.send(command);

      // 构建文件URL
      const url = this.generateAwsUrl(key);

      return {
        url,
        publicId: key,
        format: this.getFileInfo(file).extension,
        size: file.size,
        originalName: file.originalname,
        uploadType: 'aws'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`AWS上传失败: ${errorMessage}`);
    }
  }

  /**
   * 批量上传文件到AWS
   */
  async uploadMultiple(files: Express.Multer.File[]): Promise<UploadFileResult[]> {
    const uploadPromises = files.map(file => this.uploadSingle(file));
    return Promise.all(uploadPromises);
  }

  /**
   * 从AWS删除文件
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: publicId
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`AWS删除文件失败: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 生成预签名URL（用于前端直传）
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ACL: 'public-read'
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`AWS生成预签名URL失败: ${errorMessage}`);
    }
  }

  /**
   * 生成文件在AWS的访问URL
   */
  private generateAwsUrl(key: string): string {
    const endpoint = process.env.AWS_ENDPOINT;
    
    if (endpoint) {
      // 自定义端点（如兼容S3的其他服务）
      return `${endpoint.replace(/\/$/, '')}/${this.bucketName}/${key}`;
    } else {
      // 标准AWS S3 URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 生成前端直传配置
   */
  async generateUploadConfig(functionType: string = 'common') {
    const folder = this.generateFunctionFolder(functionType);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const key = `${folder}/${timestamp}_${randomString}`;

    const presignedUrl = await this.generatePresignedUrl(key);

    return {
      strategy: 'aws',
      presignedUrl,
      key,
      bucket: this.bucketName,
      region: this.region,
      endpoint: `https://${this.bucketName}.s3.${this.region}.amazonaws.com`
    };
  }

  /**
   * 获取存储桶信息
   */
  async getBucketInfo(): Promise<{
    bucketName: string;
    region: string;
    endpoint: string;
    objectCount?: number;
    totalSize?: number;
  }> {
    return {
      bucketName: this.bucketName,
      region: this.region,
      endpoint: this.generateAwsUrl('')
    };
  }

  /**
   * 批量删除文件
   */
  async deleteMultipleFiles(keys: string[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const key of keys) {
      try {
        await this.deleteFile(key);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        errors.push(`${key}: ${errorMessage}`);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // 检查AWS配置是否完整
      if (!this.bucketName || !this.region) {
        return {
          status: 'unhealthy',
          details: {
            error: 'AWS配置不完整',
            bucketName: this.bucketName,
            region: this.region
          }
        };
      }

      // 尝试列出存储桶（仅检查连通性）
      const { ListBucketsCommand } = await import('@aws-sdk/client-s3');
      const command = new ListBucketsCommand({});
      
      try {
        await this.s3Client.send(command);
      } catch (error) {
        // 忽略权限错误，只检查连通性
        if (error instanceof Error && error.name !== 'AccessDenied' && error.name !== 'Forbidden') {
          throw error;
        }
      }

      return {
        status: 'healthy',
        details: {
          bucketName: this.bucketName,
          region: this.region,
          endpoint: this.generateAwsUrl(''),
          credentialsConfigured: !!(this.s3Client.config.credentials)
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        status: 'unhealthy',
        details: {
          error: errorMessage,
          bucketName: this.bucketName,
          region: this.region
        }
      };
    }
  }
}