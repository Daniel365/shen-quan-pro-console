/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: App端活动管理路由
 */

import { ActivityController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 活动管理
router.post('/list', requireAuth(), ActivityController.list);
router.get('/details', requireAuth(), ActivityController.details);
router.post('/create', requireAuth(), ActivityController.create);
router.put('/update', requireAuth(), ActivityController.update);
router.put('/delete', requireAuth(), ActivityController.delete);

// 基于地点的活动列表
router.post('/list-by-location', requireAuth(), ActivityController.listByLocation);

export default router;
