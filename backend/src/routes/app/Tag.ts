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

// 活动标签管理
router.post('/add-to-activity', requireAuth(), TagController.addToActivity);
router.post('/remove-from-activity', requireAuth(), TagController.removeFromActivity);
router.post('/get-activity-tags', requireAuth(), TagController.getActivityTags);

// 用户标签管理
router.post('/add-to-user', requireAuth(), TagController.addToUser);
router.post('/remove-from-user', requireAuth(), TagController.removeFromUser);
router.post('/get-user-tags', requireAuth(), TagController.getUserTags);

export default router;
