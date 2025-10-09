/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: App端系统配置管理路由
 */

import { Router } from "express";
import { SystemConfigController } from "@/controllers/app";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// 系统配置管理
router.post("/list", requireAuth(), SystemConfigController.list);
router.post("/create", requireAuth(), SystemConfigController.create);
router.put("/update", requireAuth(), SystemConfigController.update);
router.delete("/delete", requireAuth(), SystemConfigController.delete);

export default router;
