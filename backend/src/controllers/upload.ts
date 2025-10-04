import { Request, Response } from 'express';
import { uploadUtils } from '@/utils/upload';
import { UploadService } from '@/services/uploadService';

/**
 * 文件上传控制器
 */
export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  /**
   * 上传单个文件
   */
  static async uploadSingle(req: Request, res: Response) {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.responseBuilder.error('upload.noFileSelected', 400);
      }

      const { functionType } = req.body;
      const result = await uploadUtils.uploadSingle(file, { folder: functionType });

      if (result.success) {
        return res.responseBuilder.success(result.data, 'upload.uploadSuccess');
      } else {
        return res.responseBuilder.error(result.error || '', 400);
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      return res.responseBuilder.error('upload.uploadFailed', 500);
    }
  }

  /**
   * 批量上传文件
   */
  static async uploadMultiple(req: Request, res: Response) {
    try {
      const files = (req as any).files;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.responseBuilder.error('upload.noFilesSelected', 400);
      }

      const { functionType } = req.body;
      const result = await uploadUtils.uploadMultiple(files, {
        folder: functionType,
      });

      if (result.success) {
        return res.responseBuilder.success(result.data, 'upload.batchUploadSuccess', {
          count: result.data.length,
        });
      } else {
        return res.responseBuilder.error(`upload.${result.error}`, 400);
      }
    } catch (error) {
      console.error('批量上传文件失败:', error);
      return res.responseBuilder.error('upload.batchUploadFailed', 500);
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(req: Request, res: Response) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.responseBuilder.error('upload.publicIdRequired', 400);
      }

      const result = await uploadUtils.deleteFile(publicId);

      if (result.success) {
        return res.responseBuilder.success(null, 'upload.deleteSuccess');
      } else {
        return res.responseBuilder.error(`upload.${result.error}`, 500);
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      return res.responseBuilder.error('upload.deleteFailed', 500);
    }
  }

  /**
   * 获取上传配置（用于前端直传）
   */
  static async getUploadConfig(req: Request, res: Response) {
    try {
      const { functionType = 'common' } = req.query;
      const result = await uploadUtils.getUploadConfig(functionType as string);

      if (result.success) {
        return res.responseBuilder.success(result.data);
      } else {
        return res.responseBuilder.error(`upload.${result.error}`, 500);
      }
    } catch (error) {
      console.error('获取上传配置失败:', error);
      return res.responseBuilder.error('upload.configFailed', 500);
    }
  }

  /**
   * 获取存储使用情况（仅本地存储）
   */
  static async getStorageUsage(req: Request, res: Response) {
    try {
      const result = await uploadUtils.getStorageUsage();

      if (result.success) {
        return res.responseBuilder.success(result.data);
      } else {
        return res.responseBuilder.error(`upload.${result.error}`, 500);
      }
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return res.responseBuilder.error('upload.storageUsageFailed', 500);
    }
  }

  /**
   * 获取上传策略信息
   */
  static async getUploadStrategy(req: Request, res: Response) {
    try {
      const result = uploadUtils.getUploadStrategy();

      if (result.success) {
        return res.responseBuilder.success(result.data);
      } else {
        return res.responseBuilder.error(`upload.${result.error}`, 500);
      }
    } catch (error) {
      console.error('获取上传策略失败:', error);
      return res.responseBuilder.error('upload.strategyFailed', 500);
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const result = await uploadUtils.healthCheck();

      if (result.success) {
        return res.responseBuilder.success(result.data);
      } else {
        return res.responseBuilder.error(`upload.${result.error}`, 500);
      }
    } catch (error) {
      console.error('健康检查失败:', error);
      return res.responseBuilder.error('upload.healthCheckFailed', 500);
    }
  }
}
