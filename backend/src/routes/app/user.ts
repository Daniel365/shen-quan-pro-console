/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 00:00:00
 * @Description: App端用户管理路由
 */

import { UserController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 用户管理
router.post('/list', requireAuth(), UserController.list);
router.put('/update', requireAuth(), UserController.update);
router.put('/delete', requireAuth(), UserController.delete);
// 下级用户列表
router.post('/children-list', requireAuth(), UserController.getChildrenByInviteCode);

export default router;
