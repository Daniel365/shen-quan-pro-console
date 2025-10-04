import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseUploadStrategy } from './baseStrategy';
import { UploadFileResult, UploadOptions } from '../../types/upload';
import { BASE_URL } from '../../config/process';

/**
 * 本地存储上传策略实现
 */
export class LocalStrategy extends BaseUploadStrategy {
  private uploadPath: string;
  private baseUrl: string;

  constructor(options: UploadOptions & { uploadPath?: string; baseUrl?: string } = {}) {
    super(options);

    this.uploadPath = options.uploadPath || path.join(process.cwd(), 'uploads');
    this.baseUrl = options.baseUrl || BASE_URL;
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 上传单个文件到本地存储
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
      const folderName = this.generateFunctionFolder(this.options.folder);
      const fullUploadPath = path.join(this.uploadPath, folderName);

      // 确保目录存在
      await this.ensureDirectory(fullUploadPath);

      // 生成文件名
      const filename = this.generateFilePath(file, folderName);
      const filePath = path.join(this.uploadPath, filename);

      // 将文件从临时目录移动到目标目录
      await fs.rename(file.path, filePath);

      // 获取文件信息
      const stats = await fs.stat(filePath);

      return {
        url: `${this.baseUrl}/${filename}`,
        publicId: filename, // 使用文件路径作为publicId
        format: path.extname(file.originalname).slice(1),
        size: stats.size,
        originalName: file.originalname,
        uploadType: 'local',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`本地存储上传失败: ${errorMessage}`);
    }
  }

  /**
   * 批量上传文件到本地存储
   */
  async uploadMultiple(files: Express.Multer.File[]): Promise<UploadFileResult[]> {
    const uploadPromises = files.map((file) => this.uploadSingle(file));
    return Promise.all(uploadPromises);
  }

  /**
   * 从本地存储删除文件
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadPath, publicId);

      // 检查文件是否存在
      await fs.access(filePath);

      // 删除文件
      await fs.unlink(filePath);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`本地存储删除文件失败: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 清理过期文件
   */
  async cleanupExpiredFiles(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      let deletedCount = 0;
      const now = Date.now();

      // 递归遍历上传目录
      const walkDir = async (dirPath: string) => {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);

            // 如果文件超过最大年龄，删除它
            if (now - stats.mtime.getTime() > maxAge) {
              await fs.unlink(fullPath);
              deletedCount++;
            }
          }
        }
      };

      await walkDir(this.uploadPath);
      return deletedCount;
    } catch (error) {
      console.error(`清理过期文件失败: ${error}`);
      return 0;
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{
    totalSize: number;
    fileCount: number;
    usagePercent?: number;
  }> {
    try {
      let totalSize = 0;
      let fileCount = 0;

      const calculateSize = async (dirPath: string) => {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await calculateSize(fullPath);
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
          }
        }
      };

      await calculateSize(this.uploadPath);

      return {
        totalSize,
        fileCount,
      };
    } catch (error) {
      console.error(`获取存储使用情况失败: ${error}`);
      return {
        totalSize: 0,
        fileCount: 0,
      };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // 检查上传目录是否可访问
      await fs.access(this.uploadPath);

      // 获取目录统计信息
      const stats = await fs.stat(this.uploadPath);

      return {
        status: 'healthy',
        details: {
          path: this.uploadPath,
          writable: true,
          totalSize: stats.size,
          lastModified: stats.mtime,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error,
          path: this.uploadPath,
        },
      };
    }
  }
}
