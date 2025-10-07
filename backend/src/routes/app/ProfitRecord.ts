/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: App端收益记录管理路由
 */

import { ProfitRecordController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 收益记录管理
router.post('/list', requireAuth(), ProfitRecordController.list);
router.post('/statistics', requireAuth(), ProfitRecordController.statistics);

// 收益结算（系统自动触发）
router.put('/settle', requireAuth(), ProfitRecordController.settle);

export default router;