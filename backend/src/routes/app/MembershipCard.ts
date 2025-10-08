/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-08 00:00:00
 * @Description: App端会员卡管理路由
 */

import { MembershipCardController } from '@/controllers/app';
import { requireAuth } from '@/middleware/auth';
import { Router } from 'express';

const router = Router();

// 会员卡管理
router.post('/list', requireAuth(), MembershipCardController.list);
router.post('/create', requireAuth(), MembershipCardController.create);
router.put('/update', requireAuth(), MembershipCardController.update);
router.delete('/delete', requireAuth(), MembershipCardController.delete);
router.get('/details', requireAuth(), MembershipCardController.details);
router.put('/toggle-status', requireAuth(), MembershipCardController.toggleStatus);
router.put('/update-sort', requireAuth(), MembershipCardController.updateSort);

export default router;
