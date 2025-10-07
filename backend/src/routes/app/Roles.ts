/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 00:00:00
 * @Description: App端角色管理路由
 */

import { Router } from "express";
import { RoleController } from "@/controllers/app";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// 角色管理
router.post("/list", requireAuth(), RoleController.list);
router.post("/create", requireAuth(), RoleController.create);
router.put("/update", requireAuth(), RoleController.update);
router.delete("/delete", requireAuth(), RoleController.delete);

export default router;
