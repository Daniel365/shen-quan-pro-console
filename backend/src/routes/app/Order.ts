/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: App端活动订单管理路由
 */

import { OrderController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 订单管理
router.post('/list', requireAuth(), OrderController.list);
router.post('/details', requireAuth(), OrderController.details);

export default router;
