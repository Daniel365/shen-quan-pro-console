/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: App端分润记录管理路由
 */

import { ProfitDistributionRecordController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 分润记录管理
router.post('/list', requireAuth(), ProfitDistributionRecordController.list);

export default router;