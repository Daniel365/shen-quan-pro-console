import { Router } from 'express';
import { UploadController } from '@/controllers/upload';
import { getMulter } from '@/utils/upload';
import { validateSingleUpload, validateMultipleUpload } from '@/middleware/upload';

const router = Router();

// 使用 utils 中的 multer 配置
const upload = getMulter();

// 上传路由（使用统一验证中间件，包含身份验证）
if (upload) {
  router.post(
    '/single',
    ...validateSingleUpload(),
    upload.single('file'),
    UploadController.uploadSingle
  );
  router.post(
    '/multiple',
    ...validateMultipleUpload(),
    upload.array('files', 10),
    UploadController.uploadMultiple
  );
}

// 文件管理路由
router.delete('/:publicId', UploadController.deleteFile);

// 配置和状态路由
router.get('/config', UploadController.getUploadConfig);
router.get('/strategy', UploadController.getUploadStrategy);
router.get('/storage-usage', UploadController.getStorageUsage);
router.get('/health', UploadController.healthCheck);

export default router;
