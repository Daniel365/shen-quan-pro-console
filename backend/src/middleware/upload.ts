/**
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 12:00:00
 * @Description: 上传验证中间件
 */

import { Request, Response, NextFunction } from 'express';
import { uploadUtils } from '../utils/upload';
import { requireAuth } from './auth';

/**
 * 创建上传验证中间件
 * @param isMultiple 是否为批量上传
 */
export function createUploadValidator(isMultiple: boolean = false) {
  return [
    // 1. 身份验证
    requireAuth({}),

    // 2. 上传验证
    (req: Request, res: Response, next: NextFunction) => {
      // 1. 验证请求格式
      const contentType = req.headers['content-type'];

      if (!contentType) {
        return res.responseBuilder.error('upload.contentTypeRequired', 400);
      }

      if (!contentType.includes('multipart/form-data')) {
        return res.responseBuilder.error('upload.invalidContentType', 400);
      }

      const boundaryMatch = contentType.match(/boundary=(.*)$/);
      if (!boundaryMatch || !boundaryMatch[1]) {
        return res.responseBuilder.error('upload.boundaryRequired', 400);
      }

      // 2. 让 multer 处理文件
      const multerNext = next;
      next = (err?: any) => {
        if (err) {
          return res.responseBuilder.error('upload.uploadFailed', 400);
        }

        // 3. 验证文件内容
        const files = isMultiple ? (req as any).files : [(req as any).file].filter(Boolean);

        if (!files || files.length === 0) {
          return res.responseBuilder.error(
            isMultiple ? 'upload.noFilesSelected' : 'upload.noFileSelected',
            400
          );
        }

        // 创建上传工具 - 配置
        const uploadConfig = uploadUtils.uploadConfig;

        for (const file of files) {
          // 验证文件类型
          if (!uploadConfig.allowedMimeTypes?.includes(file.mimetype)) {
            return res.responseBuilder.error('upload.fileTypeNotSupported', 400);
          }

          // 验证文件大小
          const maxSize = uploadConfig.maxFileSize;
          if (maxSize && file.size > maxSize) {
            return res.responseBuilder.error('upload.fileSizeExceeded', 400);
          }
        }

        // 所有验证通过，继续处理
        multerNext();
      };

      // 调用原始的 multer next
      multerNext();
    },
  ];
}

/**
 * 单文件上传验证中间件
 */
export function validateSingleUpload() {
  return createUploadValidator(false);
}

/**
 * 多文件上传验证中间件
 */
export function validateMultipleUpload() {
  return createUploadValidator(true);
}

/**
 * 需要身份验证的上传验证（自定义配置）
 */
export function requireAuthUpload(config?: {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
}) {
  return [
    requireAuth,
    (req: Request, res: Response, next: NextFunction) => {
      // 如果提供了自定义配置，可以在这里应用
      if (config) {
        // 可以在这里修改默认配置
        console.log('应用自定义上传配置:', config);
      }
      next();
    },
  ];
}
