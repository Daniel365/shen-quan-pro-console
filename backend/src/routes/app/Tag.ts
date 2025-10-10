/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: App端标签管理路由
 */

import { TagController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 标签管理
router.post('/list', requireAuth(), TagController.list);
router.post('/create', requireAuth(), TagController.create);
router.put('/update', requireAuth(), TagController.update);
router.delete('/delete', requireAuth(), TagController.delete);

export default router;
