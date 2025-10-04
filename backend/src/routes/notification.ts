/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 消息通知路由
 */

import { Router } from "express";
import { NotificationController } from "../controllers/notification";
import { requireAuth } from "../middleware/auth";

const router = Router();

// SSE连接端点 - 用户接收消息
router.get("/connect", requireAuth(), NotificationController.connect);

// 管理员发送通知
router.post("/send", requireAuth(), NotificationController.send);
// 删除通知（管理员）
router.delete("/delete", requireAuth(), NotificationController.delete);

// 获取在线用户状态（管理员）
router.get("/online-user-list", requireAuth(), NotificationController.getOnlineStatus);

// 用户获取通知列表
router.post("/list", requireAuth(), NotificationController.list);

// 标记通知为已读
router.put("/mark-read", requireAuth(), NotificationController.markAsRead);

// 批量标记为已读
router.put("/mark-all-read", requireAuth(), NotificationController.markAllAsRead);

// 获取未读通知数量
router.get("/unread-count", requireAuth(), NotificationController.getUnreadCount);

export default router;
