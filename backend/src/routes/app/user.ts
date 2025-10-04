/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 00:00:00
 * @Description: App端用户管理路由
 */

import { Router } from "express";
import { UserController } from "@/controllers/app";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// 用户管理
router.post("/list", requireAuth(), UserController.list);
router.put("/update", requireAuth(), UserController.update);
router.put("/batch-update", requireAuth(), UserController.batchUpdate);

export default router;
